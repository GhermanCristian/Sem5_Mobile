import Router from "koa-router";
import { broadcast } from "../utils";
import PredictionStore from "./store";

export const predictionRouter = new Router();

const RACE_NAMES = ["Bahrain", "Imola", "Portugal", "Barcelona", "Monaco", "Baku", "France", "Austria", "Styria", "Silverstone", "Hungaroring",
    "Spa", "Zandvoort", "Monza", "Sochi", "Turkey", "COTA", "Mexico", "Interlagos", "Qatar", "Jeddah", "AbuDhabi"];
const DRIVER_NAMES = ["Hamilton", "Bottas", "Verstappen", "Perez", "Sainz", "Leclerc", "Norris", "Ricciardo", "Vettel", "Stroll", "Alonso", "Ocon", "Gasly",
    "Tsunoda", "Russell", "Latifi", "Raikkonen", "Giovinazzi", "Schumacher", "Mazepin"]
const CURRENT_SEASON = new Date().getFullYear();

let predictions = [];

const createPrediction = async (context, prediction) => {
    const name = RACE_NAMES[(predictions.length % 22) | 0] + CURRENT_SEASON;
    const driverOrder = [...DRIVER_NAMES];
    const userID = context.state.user._id;
    prediction.name = name;
    prediction.driverOrder = driverOrder;
    prediction.userID = userID;

    context.response.body = await PredictionStore.insert(prediction);
    context.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {prediction}});
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

predictionRouter.get('/prediction', async (context) => {
    const userID = context.state.user._id;
    predictions = await PredictionStore.find({userID});
    context.response.body = predictions;
    context.response.status = 200;
});

predictionRouter.get('/prediction/:name', async (context) => {
    const userID = context.state.user._id;
    const predictionName = context.request.params.name;
    const prediction = await PredictionStore.findOne({predictionName});
    //const prediction = predictions.find(prediction => predictionName === prediction.name);

    if (prediction) {
        if (prediction.userID === userID) {
            context.response.body = prediction;
            context.response.status = 200; // ok
        }
        else {
            context.response.status = 200; // forbidden
        }
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