import {predictionRouter} from "./predictionRouter";

const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());

app.use(predictionRouter.routes());
app.use(predictionRouter.allowedMethods());

server.listen(3000);