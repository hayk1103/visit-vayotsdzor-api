'use strict';

const Koa = require('koa');
const path = require('path');
const koaBody = require('koa-body');
const respond = require('koa-respond');

const paginate = require('./middlewares/paginate');
const errorHandler = require('./middlewares/errorHandler');
const requestNormalizer = require('./middlewares/requestNormalizer');

const config = require('./config');

/**
 * ############## MIDDLEWARES ##############
 */

const app = new Koa();

app.use(require('@koa/cors')());
app.use(require('koa-static')(path.join(__dirname, './uploads')));
app.use(koaBody({ multipart: true }));
app.use(requestNormalizer);
app.use(
    respond({
        statusMethods: {
            ok: 200,
            accepted: 202,
            noContent: 204,
            movedPermanently: 301,
            movedTemporarily: 302,
            notModified: 304,
            unsupportedMediaType: 415,
            unprocessableEntity: 422
        }
    })
);
app.use(errorHandler());
app.use(paginate());

/**
 * ############## ROUTES ##############
 */
const v1Routes = require('./routes/v1');

app.use(v1Routes.routes());
app.use(v1Routes.allowedMethods());

/**
 * ############## SERVER CONFIGURATION ##############
 */
const port = process.env.PORT || config.get('PORT');
const server = require('http').createServer(app.callback());

server.listen(port, () => {
    console.info(`Server is running on port  ${port}`);
});
