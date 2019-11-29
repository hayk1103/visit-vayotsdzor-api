'use strict';

const jwt = require('jsonwebtoken');

const config = require('../config');

class JWT {
    static async sign(data) {
        return new Promise((resolve, reject) =>
            jwt.sign(data, config.get('jwt:secret'), (err, token) => (err ? reject(err) : resolve(token)))
        );
    }

    static async verify(token) {
        return new Promise((resolve, reject) =>
            jwt.verify(token, config.get('jwt:secret'), (err, data) => (err ? reject(err) : resolve(data)))
        );
    }
}

module.exports = JWT;
