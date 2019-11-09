'use strict';

const _ = require('lodash');

const { User } = require('../data/models');
const { Mailer } = require('../components');
const config = require('../config');

class Notification {
    static async sendMail(id, templateName) {
        const template = config.get(`params:mailer:templates:${templateName}`);
        const user = await User.findByPk(id);

        Mailer.send(
            _.extend(
                {
                    data: { firstName: _.get(user, 'firstName') },
                    to: [user.email]
                },
                template
            )
        );
    }

    static async activation(user, activationCode) {
        Mailer.send(
            _.extend(
                {
                    data: { firstName: user.firstName, activationCode },
                    to: [user.email]
                },
                config.get('params:mailer:templates:activation')
            )
        );
    }

    static async forgotPassword(user, activationCode) {
        Mailer.send(
            _.extend(
                {
                    data: { firstName: user.firstName, activationCode },
                    to: [user.email]
                },
                config.get('params:mailer:templates:forgotPassword')
            )
        );
    }
}

module.exports = Notification;
