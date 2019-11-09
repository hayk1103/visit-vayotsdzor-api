'use strict';

const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const randomString = require('randomstring');

class Security {
    /**
     * return integer
     */
    static generateRandomNumber() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    /**
     * @param options
     */
    static generateRandomString(options = 32) {
        return randomString.generate(options);
    }

    /**
     * @param length
     */
    static generateRandomNumeric(length = 32) {
        return randomString.generate({
            length,
            charset: 'numeric'
        });
    }

    /**
     * @param password
     * @return {Promise<*>}
     */
    static generatePasswordHash(password) {
        return bcrypt.hash(password, 10);
    }

    /**
     * @param password
     * @param hash
     * @return {*}
     */
    static validatePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    /**
     * @return {*}
     */
    static generateUuid() {
        return uuid();
    }

    /**
     * @param json
     * @return {*}
     */
    static jsonParser(json) {
        try {
            return JSON.parse(json);
        } catch (ex) {}
        return {};
    }
}

module.exports = Security;
