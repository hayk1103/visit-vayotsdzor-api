'use strict';

const Router = require('koa-router');

const MessageHandler = require('../../handlers/MessageHandler');
const auth = require('../../middlewares/auth');

const compositeAuth = auth.authenticate(['jwt.user', 'anonymous'], { session: false });
const bearerAuth = auth.authenticate(['jwt.user'], { session: false });

const router = new Router({ prefix: '/threads' });

router.get('/:threadId/messages', compositeAuth, MessageHandler.actionIndex);

router.post('/:threadId/messages', bearerAuth, MessageHandler.actionCreate);

router.put('/:threadId/messages/read', bearerAuth, MessageHandler.actionRead);

router.delete('/:threadId/messages/:messageId', bearerAuth, MessageHandler.actionDelete);

module.exports = router;
