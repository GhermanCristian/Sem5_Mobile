import React, {useCallback, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from './core';
import {Prediction} from './Prediction';
import {createPrediction, getPredictions, newWebSocket, updatePrediction} from './PredictionAPI';

const log = getLogger('PredictionProvider');

type SavePredictionFunction = (prediction: Prediction) => Promise<any>;

export interface PredictionsState {
    predictions?: Prediction[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    savePrediction?: SavePredictionFunction,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: PredictionsState = {
    fetching: false,
    saving: false,
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
    const [state, dispatch] = useReducer(reducer, initialState);
    const {predictions, fetching, fetchingError, saving, savingError} = state;

    useEffect(getPredictionsEffect, []);
    useEffect(wsEffect, []);

    const savePrediction = useCallback<SavePredictionFunction>(savePredictionCallback, []);
    const value = {predictions, fetching, fetchingError, saving, savingError, savePrediction};
    return (
        <PredictionContext.Provider value={value}>
            {children}
        </PredictionContext.Provider>
    );

    function getPredictionsEffect() {
        let canceled = false;
        fetchPredictions().then(response => log(response));
        return () => {
            canceled = true;
        }

        async function fetchPredictions() {
            try {
                log('fetchPredictions started');
                dispatch({type: FETCH_PREDICTIONS_STARTED});
                const predictions = await getPredictions();
                log('fetchPredictions succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_PREDICTIONS_SUCCEEDED, payload: {predictions}});
                }
            } catch (error) {
                log('fetchPredictions failed');
                dispatch({type: FETCH_PREDICTIONS_FAILED, payload: {error}});
            }
        }
    }

    async function savePredictionCallback(prediction: Prediction) {
        try {
            log('savePrediction started');
            dispatch({type: SAVE_PREDICTION_STARTED});
            const savedPrediction = await (prediction.name ? updatePrediction(prediction) : createPrediction(prediction));
            log('savePrediction succeeded');
            dispatch({type: SAVE_PREDICTION_SUCCEEDED, payload: {prediction: savedPrediction}});
        }
        catch (error) {
            log('savePrediction failed');
            dispatch({type: SAVE_PREDICTION_FAILED, payload: {error}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const {event, payload: {prediction}} = message;
            log(`ws message, prediction ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({type: SAVE_PREDICTION_SUCCEEDED, payload: {prediction}});
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
