'use strict';

const _ = require('lodash');

class Sanitize {
    /**
     * @param password
     * @return {*}
     */
    static cleanPassword(password) {
        return _.trim(password).replace(/ /g, '');
    }
}

module.exports = Sanitize;
