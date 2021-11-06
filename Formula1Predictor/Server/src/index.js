import {predictionRouter} from "./prediction";
import {authenticationRouter} from "./auth";
import Koa from 'koa';
import WebSocket from 'ws';
import http from 'http';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";
import { exceptionHandler, jwtConfig, initWss } from './utils';
import jwt from 'koa-jwt';
import cors from '@koa/cors';

const app = new Koa();
const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });
initWss(wss);

app.use(cors());
app.use(exceptionHandler);
app.use(bodyParser());

const publicRouter = new Router();
publicRouter.use('/auth', authenticationRouter.routes());
app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

app.use(jwt(jwtConfig));

const privateRouter = new Router();
privateRouter.use('/pred', predictionRouter.routes());
app.use(privateRouter.routes());
app.use(privateRouter.allowedMethods());

server.listen(3000);