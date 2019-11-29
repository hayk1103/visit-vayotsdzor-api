'use strict';

const Router = require('koa-router');

const jobRoute = require('./job');
const userRoute = require('./user');
const threadRoute = require('./thread');
const messageRoute = require('./message');
const categoryRoute = require('./category');
const userPasswordRoute = require('./userPassword');
const userActivationRoute = require('./userActivation');

const router = new Router({ prefix: '/v1' });

router.use(jobRoute.routes());
router.use(threadRoute.routes());
router.use(messageRoute.routes());
router.use(userRoute.routes());
router.use(categoryRoute.routes());
router.use(userActivationRoute.routes());
router.use(userPasswordRoute.routes());

router.get('/ping', ctx => ctx.ok('pong'));

module.exports = router;
