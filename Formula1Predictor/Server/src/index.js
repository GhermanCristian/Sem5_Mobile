const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const webSocketServer = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

class Prediction {
    constructor({name, text, date, version}) {
        this.name = name;
        this.text = text;
        this.date = date;
        this.version = version;
    }
}

app.use(bodyparser());
app.use(cors());
app.use(async (context, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${context.method} ${context.url} ${context.response.status} - ${ms}ms`);
});

app.use(async (context, next) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await next();
});

app.use(async (context, next) => {
    try {
        await next();
    } catch (err) {
        context.response.body = {issue: [{error: err.message || 'Unexpected error'}]};
        context.response.status = 500;
    }
});

const predictions = [];
for (let i = 0; i < 3; i++) {
    predictions.push(new Prediction({name: `prediction${i}`, text: `prediction ${i}`, date: new Date(Date.now() + i), version: 1}));
}
let lastUpdated = predictions[predictions.length - 1].date;
let lastName = predictions[predictions.length - 1].name;
const pageSize = 10;

const broadcast = data =>
    webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/prediction', context => {
    const ifModifiedSince = context.request.get('If-Modified-Since');

    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
        context.response.status = 304; // NOT MODIFIED
        return;
    }

    const text = context.request.query.text;
    const page = parseInt(context.request.query.page) || 1;
    context.response.set('Last-Modified', lastUpdated.toUTCString());
    context.response.body = predictions;
    context.response.status = 200;
});

router.get('/prediction/:name', async (context) => {
    const predictionName = context.request.params.name;
    const prediction = predictions.find(prediction => predictionName === prediction.name);

    if (prediction) {
        context.response.body = prediction;
        context.response.status = 200; // ok
    }
    else {
        context.response.body = {issue: [{warning: `prediction with name ${predictionName} not found`}]};
        context.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createPrediction = async (context) => {
    const prediction = context.request.body;
    if (!prediction.text) { // validation
        context.response.body = {issue: [{error: 'Text is missing'}]};
        context.response.status = 400; //  BAD REQUEST
        return;
    }

    prediction.name = "newname";
    lastName = prediction.name;
    prediction.date = new Date();
    prediction.version = 1;
    predictions.push(prediction);

    context.response.body = prediction;
    context.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {prediction}});
};

router.post('/prediction', async (context) => {
    await createPrediction(context);
});

router.put('/prediction/:name', async (context) => {
    const name = context.params.name;
    const prediction = context.request.body;
    prediction.date = new Date();

    const predictionName = prediction.name;
    if (predictionName && name !== prediction.name) {
        context.response.body = {issue: [{error: `Param name and body name should be the same`}]};
        context.response.status = 400; // BAD REQUEST
        return;
    }

    if (!predictionName) {
        await createPrediction(context);
        return;
    }

    const index = predictions.findIndex(prediction => prediction.name === name);
    if (index === -1) {
        context.response.body = {issue: [{error: `prediction with name ${name} not found`}]};
        context.response.status = 400; // BAD REQUEST
        return;
    }

    const predictionVersion = parseInt(context.request.get('ETag')) || prediction.version;
    if (predictionVersion < predictions[index].version) {
        context.response.body = {issue: [{error: `Version conflict`}]};
        context.response.status = 409; // CONFLICT
        return;
    }

    prediction.version++;
    predictions[index] = prediction;
    lastUpdated = new Date();
    context.response.body = prediction;
    context.response.status = 200; // OK
    broadcast({event: 'updated', payload: {prediction}});
});

router.del('/prediction/:name', context => {
    const name = context.params.name;
    const index = predictions.findIndex(prediction => name === prediction.name);

    if (index !== -1) {
        const prediction = predictions[index];
        predictions.splice(index, 1);
        lastUpdated = new Date();
        broadcast({event: 'deleted', payload: {prediction}});
    }
    context.response.status = 204; // no content
});

setInterval(() => {
    lastUpdated = new Date();
    lastName = "new" + lastName;
    const prediction = new Prediction({name: lastName, text: `prediction ${lastName}`, date: lastUpdated, version: 1});
    predictions.push(prediction);
    console.log(`${prediction.text}`);
    broadcast({event: 'created', payload: {prediction}});
}, 150000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);
