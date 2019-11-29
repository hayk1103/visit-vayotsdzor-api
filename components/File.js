'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../config');

class File {
    static async upload(name, filePath) {
        try {
            const readStream = fs.createReadStream(filePath);
            const writeStream = fs.createWriteStream(path.join('./uploads', name));

            return readStream.pipe(writeStream);
        } catch (e) {
            return {};
        }
    }

    static async remove(filePath) {
        try {
            fs.unlinkSync(`${path.join('./uploads')}/${filePath}`);
        } catch (err) {
            console.error(err);
        }
    }

    static getObjectUrl(url) {
        return `${config.get('URL')}:${config.get('PORT')}/${url}`;
    }
}

module.exports = File;
