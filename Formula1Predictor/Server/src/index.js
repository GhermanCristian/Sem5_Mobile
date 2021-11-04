import {predictionRouter} from "./prediction";
import {authenticationRouter} from "./auth";
import {exceptionHandler, initWss, jwtConfig} from "./utils";
import bodyParser from "koa-bodyparser";
import jwt from 'koa-jwt';
import WebSocket from 'ws';
import Router from "koa-router";

const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const wss = new WebSocket.Server({ server });
initWss(wss);
const cors = require('koa-cors');

app.use(cors());
app.use(exceptionHandler);
app.use(bodyParser());

const publicRouter = new Router();
publicRouter.use('/auth', authenticationRouter.routes());
app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

app.use(jwt(jwtConfig));

app.use(predictionRouter.routes());
app.use(predictionRouter.allowedMethods());

server.listen(3000);