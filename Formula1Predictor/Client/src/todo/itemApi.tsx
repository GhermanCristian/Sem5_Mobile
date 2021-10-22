import axios from 'axios';
import {getLogger} from '../core';
import {Prediction} from './Prediction';

const log = getLogger('predictionApi');

const serverURL = 'localhost:3000';
const predictionURL = `http://${serverURL}/prediction`;

interface ResponseProps<T> {
    data: T;
}

function resolveWithLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getPredictions: () => Promise<Prediction[]> = () => {
    return resolveWithLogs(axios.get(predictionURL, config), 'getPredictions');
}

export const createPrediction: (prediction: Prediction) => Promise<Prediction[]> = prediction => {
    return resolveWithLogs(axios.post(predictionURL, prediction, config), 'createPrediction');
}

export const updatePrediction: (prediction: Prediction) => Promise<Prediction[]> = prediction => {
    return resolveWithLogs(axios.put(`${predictionURL}/${prediction.name}`, prediction, config), 'updatePrediction');
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
