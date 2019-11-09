'use strict';

const _ = require('lodash');
const sendGrid = require('@sendgrid/mail');

const config = require('../config');

class Mailer {
    send(context) {
        if (_.isEmpty(context.to)) {
            throw new Error('email addressees are required');
        }
        return new Promise(resolve => {
            sendGrid.setApiKey(config.get('SENDGRID_API_KEY'));

            return resolve(
                sendGrid.send({
                    to: context.to,
                    subject: context.subject,
                    from: config.get('params:mailer:from'),
                    templateId: _.get(context, 'templateId'),
                    substitutions: _.extend(context.data, { date: new Date().getFullYear() })
                })
            );
        });
    }
}

module.exports = new Mailer();
