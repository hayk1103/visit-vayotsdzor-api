'use strict';

const _ = require('lodash');

const { JobInfoType } = require('../lcp');

module.exports = (sequelize, DataTypes) => {
    const JobInfo = sequelize.define(
        'JobInfo',
        {
            id: {
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            value: {
                allowNull: false,
                type: DataTypes.TEXT
            },
            type: {
                type: DataTypes.ENUM,
                values: _.values(JobInfoType)
            }
        },
        {
            timestamps: true,
            tableName: 'jobInfo'
        }
    );

    JobInfo.associate = models => {
        JobInfo.belongsTo(models.JobInfo, {
            as: 'job',
            foreignKey: 'jobId'
        });
    };

    JobInfo.prototype.toJSON = function() {
        const model = this.get();
        const hiddenFields = ['jobId'];

        return _.omit(model, hiddenFields);
    };

    return JobInfo;
};
