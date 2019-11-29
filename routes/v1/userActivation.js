'use strict';

const Router = require('koa-router');

const UserActivationHandler = require('../../handlers/UserActivationHandler');
const auth = require('../../middlewares/auth');

const bearerAuth = auth.authenticate(['jwt.user'], { session: false });

const router = new Router({
    prefix: '/users/activation'
});

router.post('/', bearerAuth, UserActivationHandler.actionSendActivationCode);

router.put('/', bearerAuth, UserActivationHandler.actionTakeActivationCode);

module.exports = router;
