'use strict';

const _ = require('lodash');

const { Job, JobInfo, Category, sequelize, generateSearchQuery, Location } = require('../data/models');
const { AccountType, JobInfoType } = require('../data/lcp');
const { ErrorMessages } = require('../constants');

class JobHandler {
    static async actionCreate(ctx) {
        console.log('its in job')
        const body = ctx.request.body;
        const { id: userId, accountType } = ctx.state.user;
        console.log('user', userId, accountType)

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
        const { q = '', sort = 'asc' } = ctx.query;

        const searchCondition = !_.isEmpty(q) ? generateSearchQuery(q, ['title']) : {};

        const { rows: jobs, count: total } = await Job.scope({ method: ['expand'] }).findAndCountAll({
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
        // TODO return full job object
        const {id} = ctx.params;
        const job = await Job.scope({ method: ['full'] }).findByPk(id);
        if(_.isEmpty(job)){
            return ctx.notFound(ErrorMessages.JOB_NOT_FOUND)
        }
        return ctx.ok({job});
    }
}

module.exports = JobHandler;
