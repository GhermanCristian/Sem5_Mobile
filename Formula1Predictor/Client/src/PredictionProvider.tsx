import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from './core';
import {Prediction} from './Prediction';
import {getPredictions, newWebSocket, syncData, updatePrediction} from './PredictionAPI';
import {AuthContext} from "./auth";
import {Network} from "@capacitor/core";
import { Plugins } from "@capacitor/core";
const { Storage } = Plugins;

const log = getLogger('PredictionProvider');

type SavePredictionFunction = (prediction: any) => Promise<any>;

export interface PredictionsState {
    predictions?: Prediction[],
    fetching: boolean,
    fetchingError? : Error | null,
    saving: boolean,
    savingError? : Error | null,
    savePrediction? : SavePredictionFunction,
    connectedNetwork?: boolean,
    setSavedOffline?: Function,
    savedOffline?: boolean
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: PredictionsState = {
    fetching: false,
    saving: false
};

const FETCH_PREDICTIONS_STARTED = 'FETCH_PREDICTIONS_STARTED';
const FETCH_PREDICTIONS_SUCCEEDED = 'FETCH_PREDICTIONS_SUCCEEDED';
const FETCH_PREDICTIONS_FAILED = 'FETCH_PREDICTIONS_FAILED';
const SAVE_PREDICTION_STARTED = 'SAVE_PREDICTION_STARTED';
const SAVE_PREDICTION_SUCCEEDED = 'SAVE_PREDICTION_SUCCEEDED';
const SAVE_PREDICTION_FAILED = 'SAVE_PREDICTION_FAILED';

const reducer: (state: PredictionsState, action: ActionProps) => PredictionsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_PREDICTIONS_STARTED:
                return {...state, fetching: true, fetchingError: null};

            case FETCH_PREDICTIONS_SUCCEEDED:
                return {...state, predictions: payload.predictions, fetching: false};

            case FETCH_PREDICTIONS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};

            case SAVE_PREDICTION_STARTED:
                return {...state, savingError: null, saving: true};

            case SAVE_PREDICTION_SUCCEEDED:
                const predictions = [...(state.predictions || [])];
                const prediction = payload.prediction;
                const index = predictions.findIndex(it => it.name === prediction.name);

                if (index === -1) {
                    predictions.splice(0, 0, prediction);
                }
                else {
                    predictions[index] = prediction;
                }
                return {...state, predictions, saving: false};

            case SAVE_PREDICTION_FAILED:
                return {...state, savingError: payload.error, saving: false};

            default:
                return state;
        }
    };

export const PredictionContext = React.createContext<PredictionsState>(initialState);

interface PredictionProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const PredictionProvider: React.FC<PredictionProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);
    const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
    Network.getStatus().then((status: { connected: boolean | ((prevState: boolean) => boolean); }) => setConnectedNetworkStatus(status.connected));
    const [savedOffline, setSavedOffline] = useState<boolean>(false);
    useEffect(networkEffect, [token, setConnectedNetworkStatus]);

    const [state, dispatch] = useReducer(reducer, initialState);
    const {predictions, fetching, fetchingError, saving, savingError} = state;
    useEffect(getPredictionsEffect, [token]);
    useEffect(wsEffect, [token]);

    const savePrediction = useCallback<SavePredictionFunction>(savePredictionCallback, [token]);
    const value = {predictions, fetching, fetchingError, saving, savingError, savePrediction, connectedNetworkStatus, savedOffline, setSavedOffline };
    return (
        <PredictionContext.Provider value={value}>
            {children}
        </PredictionContext.Provider>
    );

    function networkEffect() {
        console.log("network effect");
        let canceled = false;
        Network.addListener('networkStatusChange', async (status: { connected: boolean | ((prevState: boolean) => boolean); }) => {
            if (canceled) return;
            const connected = status.connected;
            if (connected) {
                console.log("networkEffect - SYNC data");
                await syncData(token);
            }
            setConnectedNetworkStatus(status.connected);
        });
        return () => {
            canceled = true;
        }
    }

    function getPredictionsEffect() {
        let canceled = false;
        fetchPredictions().then(response => log(response));
        return () => {
            canceled = true;
        }

        async function fetchPredictions() {
            if (!token?.trim()) {
                return;
            }
            if (!navigator?.onLine) { // offline
                let storageKeys = Storage.keys();
                const [predictions] = await Promise.all([storageKeys.then(async function (storageKeys: { keys: string | any[]; }) {
                    const saved = [];
                    for (let i = 0; i < storageKeys.keys.length; i++) {
                        if (storageKeys.keys[i] !== "token") {
                            const prediction = await Storage.get({key: storageKeys.keys[i]});
                            if (prediction.value != null) {
                                saved.push(JSON.parse(prediction.value));
                            }
                        }
                    }
                    return saved;
                })]);
                dispatch({type: FETCH_PREDICTIONS_SUCCEEDED, payload: {items: predictions}});
            }
            else {
                try {
                    log('fetchPredictions started');
                    dispatch({type: FETCH_PREDICTIONS_STARTED});
                    const predictions = await getPredictions(token);
                    log('fetchPredictions successful');
                    log(predictions);
                    if (!canceled) {
                        dispatch({type: FETCH_PREDICTIONS_SUCCEEDED, payload: {predictions: predictions}})
                    }
                }
                catch (error) {

                }
            }
        }
    }

    async function savePredictionCallback(prediction: Prediction) {
        if (navigator.onLine) {
            log('savePrediction started');
            dispatch({ type: SAVE_PREDICTION_STARTED });
            const savedPrediction = await updatePrediction(token, prediction);
            log('savePrediction successful');
            dispatch({type: SAVE_PREDICTION_SUCCEEDED, payload: {prediction: savedPrediction}});
        }
        else {
            prediction._id = (prediction._id == undefined) ? '_' + Math.random().toString(36).substr(2, 9) : prediction._id;
            await Storage.set({key: prediction._id!, value: JSON.stringify({_id: prediction._id, name: prediction.name, driverOrder: prediction.driverOrder, webViewPath: prediction.webViewPath})});
            dispatch({type: SAVE_PREDICTION_SUCCEEDED, payload: {prediction : prediction}});
            setSavedOffline(true);
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(message => {
                if (canceled) {
                    return;
                }
                const {event, payload: {prediction}} = message;
                log(`ws message, prediction ${event}`);
                if (event === 'created' || event === 'updated') {
                    dispatch({type: SAVE_PREDICTION_SUCCEEDED, payload: {prediction}});
                }
            });
        }

        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
