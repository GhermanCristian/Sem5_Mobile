import axios from 'axios';
import {authConfig, getLogger} from './core';
import {Prediction} from './Prediction';
import { Storage } from '@capacitor/storage';

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

export const getPredictions: (token: string) => Promise<Prediction[]> = (token) => {
    return resolveWithLogs(axios.get(predictionURL, authConfig(token)));
}

export const createPrediction: (token: string) => Promise<Prediction> = (token) => {
    return resolveWithLogs(axios.post(predictionURL, {}, authConfig(token)));
}

export const updatePrediction: (token: string, prediction: Prediction) => Promise<Prediction> = (token, prediction) => {
    return resolveWithLogs(axios.put(`${predictionURL}/${prediction._id}`, prediction, authConfig(token)));
}

function areDifferent(prediction1: Prediction, prediction2: Prediction) {
    return prediction1.name !== prediction2.name || prediction1.driverOrder !== prediction2.driverOrder;
}

export const syncData: (token: string) => Promise<Prediction[]> = async token => {
    try {
        const {keys} = await Storage.keys();
        const result: Promise<ResponseProps<Prediction[]>> = axios.get(predictionURL, authConfig(token));
        result.then(async result => {
            for (const i of keys) {
                if (i !== 'token') {
                    const predictionOnServer = result.data.find(prediction => prediction._id === i);
                    const predictionLocal = JSON.parse((await Storage.get({key: i})).value!);

                    console.log('PREDICTION ON SERVER: ' + JSON.stringify(predictionOnServer));
                    console.log('PREDICTION LOCALLY: ' + predictionLocal);

                    if (predictionOnServer !== undefined && areDifferent(predictionOnServer, predictionLocal)) {
                        console.log('UPDATE ' + predictionLocal);
                        axios.put(`${predictionURL}/${predictionLocal._id}`, predictionLocal, authConfig(token));
                    }
                    else if (predictionOnServer === undefined) {
                        console.log('CREATE' + predictionLocal);
                        axios.post(`${predictionURL}/move_prediction`, predictionLocal, authConfig(token));
                    }
                }
            }
        }).catch(err => {
            if (err.response) {
                console.log('client received an error response (5xx, 4xx)');
            }
            else if (err.request) {
                console.log('client never received a response, or request never left');
            }
            else {
                console.log('anything else');
            }
        });
        return resolveWithLogs(result);
    }
    catch (error) {
        throw error;
    }
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
