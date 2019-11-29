'use strict';

const _ = require('lodash');
const jwt = require('jsonwebtoken');

const { User } = require('../data/models');
const config = require('../config');

module.exports = {
    connect: io => {
        global.io = io;

        io.use(async (socket, next) => {
            try {
                const { token } = socket.handshake.query;

                const { id } = jwt.verify(token, config.get('jwt:secret'));
                const user = await User.findOne({ where: { id }, attributes: ['id'], raw: true });

                if (_.isEmpty(user)) {
                    return next(new Error('Authentication failed.'));
                }

                socket.join(user.id);

                return next();
            } catch (ex) {
                console.error(ex);
                return next(new Error('Authentication error.'));
            }
        });
    }
};
