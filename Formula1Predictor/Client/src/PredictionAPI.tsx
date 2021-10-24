import axios from 'axios';
import {getLogger} from './core';
import {Prediction} from './Prediction';

const log = getLogger('predictionApi');

const serverURL = 'localhost:3000';
const predictionURL = `http://${serverURL}/prediction`;

interface ResponseProps<T> {
    data: T;
}

function resolveWithLogs<T>(promise: Promise<ResponseProps<T>>): Promise<T> {
    return promise
        .then(res => Promise.resolve(res.data))
        .catch(err => Promise.reject(err));
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getPredictions: () => Promise<Prediction[]> = () => {
    return resolveWithLogs(axios.get(predictionURL, config));
}

export const createPrediction: () => Promise<Prediction[]> = () => {
    return resolveWithLogs(axios.post(predictionURL, {}, config));
}

export const updatePrediction: (prediction: Prediction) => Promise<Prediction[]> = prediction => {
    return resolveWithLogs(axios.put(`${predictionURL}/${prediction.name}`, prediction, config));
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
