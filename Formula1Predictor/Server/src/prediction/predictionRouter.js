import Router from "koa-router";
import {Prediction} from "./Prediction";
const WebSocket = require('ws');

export const predictionRouter = new Router();

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const RACE_NAMES = ["Bahrain", "Imola", "Portugal", "Barcelona", "Monaco", "Baku", "France", "Austria", "Styria", "Silverstone", "Hungaroring",
    "Spa", "Zandvoort", "Monza", "Sochi", "Turkey", "COTA", "Mexico", "Interlagos", "Qatar", "Jeddah", "AbuDhabi"];
const DRIVER_NAMES = ["Hamilton", "Bottas", "Verstappen", "Perez", "Sainz", "Leclerc", "Norris", "Ricciardo", "Vettel", "Stroll", "Alonso", "Ocon", "Gasly",
    "Tsunoda", "Russell", "Latifi", "Raikkonen", "Giovinazzi", "Schumacher", "Mazepin"]
const CURRENT_SEASON = new Date().getFullYear();
const CURRENT_RACE = Math.floor(Math.random() * Math.floor(RACE_NAMES.length / 2)) + 2;
const predictions = [];
for (let i = 0; i < CURRENT_RACE - 1; i++) {
    predictions.push(new Prediction({name: RACE_NAMES[i]+CURRENT_SEASON, driverOrder: shuffleArray([...DRIVER_NAMES])}));
}

const broadcast = data =>
    webSocketServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const createPrediction = async (context) => {
    const name = RACE_NAMES[predictions.length % 22] + CURRENT_SEASON;
    const driverOrder = [...DRIVER_NAMES];
    const newPrediction = new Prediction({name, driverOrder});

    predictions.push(newPrediction);
    context.response.body = newPrediction;
    context.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {newPrediction}});
};

const updatePrediction = async (context) => {
    const name = context.params.name;
    const prediction = context.request.body;

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

    predictions[index] = prediction;
    context.response.body = prediction;
    context.response.status = 200; // OK
    broadcast({event: 'updated', payload: {prediction}});
}

predictionRouter.get('/prediction', context => {
    context.response.body = predictions;
    context.response.status = 200;
});

predictionRouter.get('/prediction/:name', async (context) => {
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

predictionRouter.post('/prediction', async (context) => {
    await createPrediction(context);
});

predictionRouter.put('/prediction/:name', async (context) => {
    await updatePrediction(context);
});