'use strict';

const _ = require('lodash');

const { Job, JobInfo, Category, sequelize, generateSearchQuery, Location } = require('../data/models');
const { AccountType, JobInfoType } = require('../data/lcp');
const { ErrorMessages, FilterType } = require('../constants');
const { File } = require('../components');

class JobHandler {
    static async actionCreate(ctx) {
        // TODO add logo
        const body = ctx.request.body;
        const { id: userId, accountType } = ctx.state.user;

        const { title, description, type, vacancy, gender, salary, deadline, info = {}, categoryId } = body;
        const { educations = [], benefits = [], responsibilities = [], location } = info;

        if (accountType !== AccountType.EMPLOYERS) {
            return ctx.forbidden(ErrorMessages.INVALID_ACCOUNT_TYPE);
        }

        const category = await Category.findOne({ where: { id: categoryId }, attributes: ['id'], raw: true });

        if (_.isEmpty(category)) {
            return ctx.notFound(ErrorMessages.CATEGORY_REQUIRED);
        }

        if (_.isEmpty(location) || !_.isObject(location)) {
            return ctx.badRequest(ErrorMessages.LOCATION_REQUIRED);
        }

        await sequelize.transaction(async transaction => {
            const { id: jobId } = await Job.create(
                { title, description, type, vacancy, gender, salary, deadline, userId, categoryId },
                { transaction }
            );

            await Location.create({ jobId, ...location }, { transaction });

            if (!_.isEmpty(educations)) {
                await JobInfo.bulkCreate(
                    _.map(educations, education => ({
                        jobId,
                        value: education,
                        type: JobInfoType.EDUCATION
                    })),
                    { validate: true, transaction }
                );
            }

            if (!_.isEmpty(benefits)) {
                await JobInfo.bulkCreate(
                    _.map(benefits, benefit => ({
                        jobId,
                        value: benefit,
                        type: JobInfoType.OTHER_BENEFIT
                    })),
                    { validate: true, transaction }
                );
            }

            if (!_.isEmpty(responsibilities)) {
                await JobInfo.bulkCreate(
                    _.map(responsibilities, responsibility => ({
                        jobId,
                        value: responsibility,
                        type: JobInfoType.RESPONSIBILITY
                    })),
                    { validate: true, transaction }
                );
            }
        });

        return ctx.created();
    }

    static async actionIndex(ctx) {
        const { limit, offset } = ctx.paginate;
        const userId = _.get(ctx.state, 'user.id', null);
        const { q = '', sort = 'asc', filter = FilterType.JOB.CREATED_BY_ME } = ctx.query;

        if (!_.includes(_.values(FilterType.JOB), filter)) {
            return ctx.badRequest(ErrorMessages.INVALID_TYPE);
        }

        const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, ['title']) : {};

        const { rows: jobs, count: total } = await Job.scope({
            method: ['expand', userId, filter]
        }).findAndCountAll({
            limit,
            offset,
            order: [['createdAt', sort]],
            where: { ...searchCondition }
        });

        return ctx.ok({
            jobs,
            _meta: {
                total,
                pageCount: Math.ceil(total / limit)
            }
        });
    }

    static async actionView(ctx) {
        const { id } = ctx.params;

        const job = await Job.scope({ method: ['full'] }).findByPk(id);

        if (_.isEmpty(job)) {
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND);
        }

        return ctx.ok({ job });
    }

    static async actionUpdate(ctx) {
        // TODO
        const { id: userId } = ctx.state.user;
        const jobId = ctx.params.id;
        const body = ctx.request.body;

        const { title, description, type, vacancy, gender, salary, deadline, info = {} } = body;
        const { location = {}, benefits = [], educations = [], responsibilities = [] } = info;

        const jobLocation = await Location.findOne({ where: { jobId } });
        const jobInfo = await JobInfo.findOne({ where: { jobId } });

        await sequelize.transaction(async transaction => {
            await Job.update(
                { title, description, type, vacancy, gender, salary, deadline },
                { where: { id: jobId, userId }, transaction }
            );

            _.isEmpty(jobLocation)
                ? await Location.create(_.extend(location, { jobId }), { transaction })
                : await jobLocation.update(location, { transaction });

            await JobInfo.destroy({ where: { jobId }, transaction });

            if (!_.isEmpty(jobInfo)) {
                await JobInfo.bulkCreate(
                    _.map(benefits, benefit => ({
                        type: JobInfoType.OTHER_BENEFIT,
                        value: benefit,
                        jobId: jobId
                    })),
                    { validate: true, transaction }
                );
                await JobInfo.bulkCreate(
                    _.map(educations, education => ({
                        type: JobInfoType.EDUCATION,
                        value: education,
                        jobId: jobId
                    })),
                    { validate: true, transaction }
                );
                await JobInfo.bulkCreate(
                    _.map(responsibilities, responsibility => ({
                        type: JobInfoType.RESPONSIBILITY,
                        value: responsibility,
                        jobId: jobId
                    })),
                    { validate: true, transaction }
                );
            }
        });
        return ctx.ok();
    }

    static async actionUploadLogo(ctx) {
        const userId = ctx.state.user.id;
        const jobId = ctx.params.id;
        const logo = _.get(ctx.request, 'files.logo');
        const { extensions, size } = config.get('params:files:avatars:allowed');

        const job = await Job.findOne({ where: { id: jobId, userId } });

        if (_.isEmpty(job)) {
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND);
        }

        if (_.isEmpty(logo)) {
            return ctx.badRequest(ErrorMessages.LOGO_REQUIRED);
        }

        if (!_.includes(extensions, logo.ext)) {
            return ctx.badRequest(ErrorMessages.INVALID_FILE_TYPE);
        } else if (logo.size > size) {
            return ctx.badRequest(ErrorMessages.INVALID_FILE_SIZE);
        }

        await sequelize.transaction(async transaction => {
            await File.upload(logo.key, logo.path).catch(console.trace);
            await job.save({ transaction });
        });

        return ctx.ok({ logo: await File.getObjectUrl(logo.key) });
    }

    static async actionRemoveLogo(ctx) {
        const userId = ctx.state.user.id;
        const jobId = ctx.params.id;

        const job = await Job.findOne({ where: { id: jobId, userId } });

        if (_.isEmpty(job)) {
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND);
        }

        const logo = job.logo;

        if (!_.isEmpty(logo)) {
            job.logo = null;
            await job.save();

            File.remove(logo).catch(console.trace);
        }

        return ctx.noContent();
    }

    static async actionDelete(ctx) {
        // TODO
        const userId = ctx.state.user.id;
        const jobId = ctx.params.id;

        const result = await Job.destroy({ where: { id: jobId, userId } });

        if (!result) {
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND);
        }

        return ctx.noContent();
    }

    static async actionArchive(ctx) {
        const userId = ctx.state.user.id;
        const jobId = ctx.params.id;

        const job = await Job.findOne({ where: { id: jobId, userId } });

        if (_.isEmpty(job)) {
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND);
        }

        job.isArchived = true;

        await job.save({ job });

        return ctx.ok();
    }

    static async actionUnArchive(ctx) {
        const userId = ctx.state.user.id;
        const jobId = ctx.params.id;

        const job = await Job.findOne({ where: { id: jobId, userId } });

        if (_.isEmpty(job)) {
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND);
        }

        job.isArchived = false;

        await job.save({ job });

        return ctx.ok();
    }
}

module.exports = JobHandler;
