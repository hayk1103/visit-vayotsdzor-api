'use strict';

const Router = require('koa-router');

const UserPasswordHandler = require('../../handlers/UserPasswordHandler');
const auth = require('../../middlewares/auth');

const bearerAuth = auth.authenticate(['jwt.user'], { session: false });

const router = new Router({
    prefix: '/users'
});

router.post('/password/check-code', UserPasswordHandler.actionCheckPasswordCode);
router.post('/reset-password', UserPasswordHandler.actionResetPassword);

router.put('/password', bearerAuth, UserPasswordHandler.actionChangePassword);

router.put('/forgot-password', UserPasswordHandler.actionForgotPassword);

module.exports = router;
