'use strict';

const _ = require('lodash');
const passportJwt = require('passport-jwt');
const koaPassport = require('koa-passport');
const passportAnonymous = require('passport-anonymous');

const { User } = require('../data/models');
const config = require('../config');

const { ExtractJwt } = passportJwt;
const JwtStrategy = passportJwt.Strategy;
const AnonymousStrategy = passportAnonymous.Strategy;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('jwt:secret')
};

koaPassport.use(
    'jwt.user',
    new JwtStrategy(jwtOptions, async (payload, done) => {
        try {
            const user = await User.findOne({
                where: { id: payload.id, accessTokenSalt: payload.salt }
            });

            if (_.isEmpty(user) || user.accessTokenSalt !== payload.salt) {
                return done(null, null);
            }

            done(null, user);
        } catch (e) {
            done(e, null);
        }
    })
);

koaPassport.use(new AnonymousStrategy());

module.exports = koaPassport;
