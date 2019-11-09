'use strict';

const _ = require('lodash');
const fileType = require('file-type');
const readChunk = require('read-chunk');


const { File, Security } = require('../components');

const fileTypes = {
    csv: { ext: 'csv', mime: 'text/csv' }
};

async function normalizeFile(file) {
    console.log('its in middleware')
    const fileInfo = fileType(readChunk.sync(_.get(file, 'path'), 0, 4 + 4096)) || {};

    return {
        key: `${Security.generateRandomString()}.${_.get(fileInfo, 'ext')}`,
        type: _.head(_.split(_.get(fileInfo, 'mime'), '/')),
        size: _.toString(_.get(file, 'size')),
        mime: _.get(fileInfo, 'mime'),
        ext: _.get(fileInfo, 'ext'),
        path: _.get(file, 'path'),
        name: _.get(file, 'name')
    };
}

async function normalizer(ctx, next) {
    if (ctx.request.type === 'multipart/form-data') {
        for (let key of _.keys(ctx.request.files)) {
            const value = _.get(ctx.request.files, key);

            if (_.isArray(value)) {
                ctx.request.files[key] = [];

                for (let item of value) {
                    ctx.request.files[key].push(await normalizeFile(item));
                }
            } else if (_.isObject(value)) {
                ctx.request.files[key] = await normalizeFile(value);
            }
        }
    }

    await next();
}

module.exports = normalizer;
