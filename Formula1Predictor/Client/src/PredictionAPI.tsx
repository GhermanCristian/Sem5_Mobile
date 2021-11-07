import axios from 'axios';
import {authConfig, getLogger} from './core';
import {Prediction} from './Prediction';

const log = getLogger('predictionApi');

const serverURL = 'localhost:3000';
const predictionURL = `http://${serverURL}/pred/prediction`;

interface ResponseProps<T> {
    data: T;
}

function resolveWithLogs<T>(promise: Promise<ResponseProps<T>>): Promise<T> {
    return promise
        .then(res => Promise.resolve(res.data))
        .catch(err => Promise.reject(err));
}

export const getAllDrivers: (token: string) => Promise<string[]> = (token) => {
    return resolveWithLogs(axios.get(`http://${serverURL}/pred/allDrivers`, authConfig(token)));
}

export const getPredictionsPaged: (token: string, page: number) => Promise<Prediction[]> = (token, page) => {
    return resolveWithLogs(axios.get(predictionURL + "/page/" + page, authConfig(token)));
}

export const getPredictions: (token: string) => Promise<Prediction[]> = (token) => {
    return resolveWithLogs(axios.get(predictionURL, authConfig(token)));
}

export const createPrediction: (token: string) => Promise<Prediction[]> = (token) => {
    return resolveWithLogs(axios.post(predictionURL, {}, authConfig(token)));
}

export const updatePrediction: (token: string, prediction: Prediction) => Promise<Prediction[]> = (token, prediction) => {
    return resolveWithLogs(axios.put(`${predictionURL}/${prediction.name}`, prediction, authConfig(token)));
}

interface MessageData {
    event: string;
    payload: {
        prediction: Prediction;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const webSocket = new WebSocket(`ws://${serverURL}`)
    webSocket.onopen = () => {
        log('web socket onopen');
    };
    webSocket.onclose = () => {
        log('web socket onclose');
    };
    webSocket.onerror = error => {
        log('web socket onerror', error);
    };
    webSocket.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        webSocket.close();
    }
}
