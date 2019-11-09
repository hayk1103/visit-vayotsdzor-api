'use strict';

const Router = require('koa-router');

const JobHandler = require('../../handlers/JobHandler');
const auth = require('../../middlewares/auth');

const compositeAuth = auth.authenticate(['jwt.user', 'anonymous'], { session: false });
const bearerAuth = auth.authenticate(['jwt.user'], { session: false });

const router = new Router({
    prefix: '/jobs'
});

router.get('/:id', compositeAuth, JobHandler.actionView);
router.get('/', compositeAuth, JobHandler.actionIndex);

router.post('/', bearerAuth, JobHandler.actionCreate);

module.exports = router;
