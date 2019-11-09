'use strict';

const Router = require('koa-router');

const CategoryHandler = require('../../handlers/CategoryHandler');
const auth = require('../../middlewares/auth');

const compositeAuth = auth.authenticate(['jwt.user', 'anonymous'], { session: false });

const router = new Router({
    prefix: '/categories'
});

router.get('/', compositeAuth, CategoryHandler.actionIndex);

module.exports = router;
