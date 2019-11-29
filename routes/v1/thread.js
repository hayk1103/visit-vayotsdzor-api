'use strict';

const Router = require('koa-router');

const ThreadHandler = require('../../handlers/ThreadHandler');
const auth = require('../../middlewares/auth');

const compositeAuth = auth.authenticate(['jwt.user', 'anonymous'], { session: false });
const bearerAuth = auth.authenticate(['jwt.user'], { session: false });

const router = new Router({ prefix: '/threads' });

router.get('/', compositeAuth, ThreadHandler.actionIndex);
router.get('/:threadId', compositeAuth, ThreadHandler.actionView);

router.post('/', bearerAuth, ThreadHandler.actionCreate);

router.put('/:threadId/typing', bearerAuth, ThreadHandler.actionTyping);

router.delete('/:threadId', bearerAuth, ThreadHandler.actionDelete);

module.exports = router;
