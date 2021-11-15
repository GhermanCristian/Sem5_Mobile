import Router from "koa-router";
import {broadcast} from "../utils";
import PredictionStore from "./store";
import {Prediction} from "./Prediction";

export const predictionRouter = new Router();

const PREDICTIONS_PER_PAGE = 3;
const RACE_NAMES = ["Bahrain", "Imola", "Portugal", "Barcelona", "Monaco", "Baku", "France", "Austria", "Styria", "Silverstone", "Hungaroring",
    "Spa", "Zandvoort", "Monza", "Sochi", "Turkey", "COTA", "Mexico", "Interlagos", "Qatar", "Jeddah", "AbuDhabi"];
const DRIVER_NAMES = ["Hamilton", "Bottas", "Verstappen", "Perez", "Sainz", "Leclerc", "Norris", "Ricciardo", "Vettel", "Stroll", "Alonso", "Ocon", "Gasly",
    "Tsunoda", "Russell", "Latifi", "Raikkonen", "Giovinazzi", "Schumacher", "Mazepin"]
const CURRENT_SEASON = new Date().getFullYear();

const createPrediction = async (context) => {
    const userID = context.state.user._id;
    const predictionCount = (await PredictionStore.find({userID})).length;
    const name = RACE_NAMES[(predictionCount % 22) | 0] + CURRENT_SEASON;
    const driverOrder = [...DRIVER_NAMES];
    let prediction = new Prediction({name, driverOrder});
    prediction.userID = userID;

    try {
        context.response.body = await PredictionStore.insert(prediction);
        context.response.status = 201; // CREATED
        broadcast({event: 'created', payload: {prediction}});
    }
    catch (e) {
        console.log(e.message);
        context.response.body = { message: e.message };
        context.response.status = 400; // bad request
    }
};

const updatePrediction = async (context) => {
    const name = context.params.name;
    const prediction = context.request.body;
    const predictionName = prediction.name;
    const predictionID = prediction._id;

    if (predictionName && name !== prediction.name) {
        context.response.body = {issue: [{error: `Param name and body name should be the same`}]};
        context.response.status = 400; // BAD REQUEST
        return;
    }

    if (!predictionName) {
        await createPrediction(context);
        return;
    }

    prediction.userID = context.state.user._id;
    const updatedCount = await PredictionStore.update({_id: predictionID}, prediction);

    if (updatedCount === 1) {
        context.response.body = prediction;
        context.response.status = 200; // OK
        broadcast({event: 'updated', payload: {prediction}});
    }
    else {
        context.response.body = { message: 'Resource no longer exists' };
        context.response.status = 405; // method not allowed
    }
}

predictionRouter.get('/prediction/page/:page', async (context) => {
    const page = context.params.page;
    const userID = context.state.user._id;
    context.response.body = (await PredictionStore.find({userID})).slice((page - 1) * PREDICTIONS_PER_PAGE, page * PREDICTIONS_PER_PAGE);
    context.response.status = 200;
});

predictionRouter.get('/prediction', async (context) => {
    const userID = context.state.user._id;
    context.response.body = await PredictionStore.find({userID});
    context.response.status = 200;
});

predictionRouter.get('/prediction/:name', async (context) => {
    const userID = context.state.user._id;
    const predictionName = context.request.params.name;
    const prediction = await PredictionStore.findOne({predictionName});

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

predictionRouter.post('/move_prediction', async (context) => {
    const prediction = context.request.body;
    await PredictionStore.insert(prediction);
});

predictionRouter.put('/prediction/:name', async (context) => {
    await updatePrediction(context);
});