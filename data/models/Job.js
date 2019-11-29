'use strict';

const _ = require('lodash');

const { JobType, JobCategory, JobInfoType } = require('../lcp');
const config = require('../../config');

module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define(
        'Job',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            title: {
                allowNull: false,
                type: DataTypes.STRING
            },
            description: {
                allowNull: false,
                type: DataTypes.TEXT
            },
            type: {
                type: DataTypes.ENUM,
                values: _.values(JobType)
            },
            vacancy: {
                type: DataTypes.INTEGER
            },
            gender: {
                type: DataTypes.ENUM,
                values: _.values(JobCategory)
            },
            salary: {
                type: DataTypes.STRING
            },
            deadline: {
                type: DataTypes.DATEONLY
            },
            logo: {
                type: DataTypes.STRING
            },
            isArchived: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            timestamps: true,
            tableName: 'job',
            setterMethods: {
                title(value) {
                    this.setDataValue('title', value ? _.trim(value) : null);
                },
                description(value) {
                    this.setDataValue('description', value ? _.trim(value) : null);
                },
                salary(value) {
                    this.setDataValue('salary', value ? _.trim(value) : null);
                }
            }
        }
    );

    Job.associate = models => {
        Job.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId'
        });

        Job.belongsTo(models.Category, {
            as: 'category',
            foreignKey: 'categoryId'
        });

        Job.hasOne(models.Location, {
            as: 'location',
            foreignKey: 'jobId'
        });

        Job.hasMany(models.JobInfo, {
            as: 'educations',
            foreignKey: 'jobId',
            scope: { type: JobInfoType.EDUCATION }
        });

        Job.hasMany(models.JobInfo, {
            as: 'benefits',
            foreignKey: 'jobId',
            scope: { type: JobInfoType.OTHER_BENEFIT }
        });

        Job.hasMany(models.JobInfo, {
            as: 'responsibilities',
            foreignKey: 'jobId',
            scope: { type: JobInfoType.RESPONSIBILITY }
        });
    };

    Job.filters = userId => {
        return {
            createdByMe: { userId, isArchived: false },
            archived: { userId, isArchived: true },
            active: { isArchived: true }
        };
    };

    Job.addScopes = models => {
        const { userAttributes, locationAttributes } = config.get('params:model:attributes');

        Job.addScope('expand', (userId, type) => {
            const condition = models.Job.filters(userId)[type];

            return {
                where: { $and: [condition] },
                include: [
                    { model: models.Location, as: 'location', attributes: locationAttributes },
                    { model: models.User, as: 'user', attributes: userAttributes }
                ]
            };
        });

        Job.addScope('full', () => {
            return {
                include: [
                    { model: models.Location, as: 'location', attributes: locationAttributes },
                    { model: models.User, as: 'user', attributes: userAttributes },
                    { model: models.JobInfo, as: 'responsibilities' },
                    { model: models.JobInfo, as: 'educations' },
                    { model: models.JobInfo, as: 'benefits' }
                ]
            };
        });
    };

    Job.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['categoryId', 'userId'];

        return _.omit(model, hiddenFields);
    };

    return Job;
};
