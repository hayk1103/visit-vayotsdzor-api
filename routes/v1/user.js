'use strict';

const Router = require('koa-router');

const UserHandler = require('../../handlers/UserHandler');
const auth = require('../../middlewares/auth');

const compositeAuth = auth.authenticate(['jwt.user', 'anonymous'], { session: false });
const bearerAuth = auth.authenticate(['jwt.user'], { session: false });

const router = new Router({
    prefix: '/users'
});

router.get('/:id', compositeAuth, UserHandler.actionView);
router.get('/', compositeAuth, UserHandler.actionIndex);

router.post('/', UserHandler.actionCreate);
router.post('/login', UserHandler.actionLogin);

router.put('/', bearerAuth, UserHandler.actionUpdate);

module.exports = router;