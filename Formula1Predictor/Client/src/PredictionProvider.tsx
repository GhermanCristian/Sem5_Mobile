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

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: PredictionsState, action: ActionProps) => PredictionsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return {...state, fetching: true, fetchingError: null};

            case FETCH_ITEMS_SUCCEEDED:
                return {...state, predictions: payload.predictions, fetching: false};

            case FETCH_ITEMS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};

            case SAVE_ITEM_STARTED:
                return {...state, savingError: null, saving: true};

            case SAVE_ITEM_SUCCEEDED:
                const predictions = [...(state.predictions || [])];
                const item = payload.item;
                const index = predictions.findIndex(it => it.name === item.name);

                if (index === -1) {
                    predictions.splice(0, 0, item);
                }
                else {
                    predictions[index] = item;
                }
                return {...state, predictions, saving: false};

            case SAVE_ITEM_FAILED:
                return {...state, savingError: payload.error, saving: false};

            default:
                return state;
        }
    };

export const ItemContext = React.createContext<PredictionsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const PredictionProvider: React.FC<ItemProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const {predictions, fetching, fetchingError, saving, savingError} = state;

    useEffect(getItemsEffect, []);
    useEffect(wsEffect, []);

    const savePrediction = useCallback<SavePredictionFunction>(saveItemCallback, []);
    const value = {predictions, fetching, fetchingError, saving, savingError, savePrediction};
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function getItemsEffect() {
        let canceled = false;
        fetchItems().then(response => log(response));
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try {
                log('fetchItems started');
                dispatch({type: FETCH_ITEMS_STARTED});
                const predictions = await getPredictions();
                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {predictions}});
                }
            } catch (error) {
                log('fetchItems failed');
                dispatch({type: FETCH_ITEMS_FAILED, payload: {error}});
            }
        }
    }

    async function saveItemCallback(item: Prediction) {
        try {
            log('savePrediction started');
            dispatch({type: SAVE_ITEM_STARTED});
            const savedItem = await (item.name ? updatePrediction(item) : createPrediction(item));
            log('savePrediction succeeded');
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: savedItem}});
        }
        catch (error) {
            log('savePrediction failed');
            dispatch({type: SAVE_ITEM_FAILED, payload: {error}});
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
            log(`ws message, item ${event}`);
            if (event === 'created' || event === 'updated') {
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {prediction}});
            }
        });
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket();
        }
    }
};
