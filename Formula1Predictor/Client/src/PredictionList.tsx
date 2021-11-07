import React, {useContext, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar, useIonViewWillEnter
} from '@ionic/react';
import {add} from 'ionicons/icons';
import PredictionListItem from './PredictionListItem';
import {PredictionContext} from './PredictionProvider';
import {createPrediction, getPredictionsPaged} from "./PredictionAPI";
import {getLogger} from "./core";
import {Prediction} from "./Prediction";

const log = getLogger('ItemList');

const PredictionList: React.FC<RouteComponentProps> = ({history}) => {
    let {predictions, fetching, fetchingError, token} = useContext(PredictionContext);
    let page: number = 1;
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

    const addNewPrediction = async () => {
        await createPrediction(token);
    }

    async function fetchPredictions() {
        const newPredictions: Prediction[] = await getPredictionsPaged(token, page);
        if (newPredictions && newPredictions.length > 0) {
            predictions = newPredictions;
            setDisableInfiniteScroll(newPredictions.length < 3);
        }
        else {
            setDisableInfiniteScroll(true);
        }
    }

    useIonViewWillEnter(async () => {
        await fetchPredictions();
    });

    async function searchNext($event: CustomEvent<void>) {
        page++;
        await fetchPredictions();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Predictions</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching predictions"/>
                {predictions && (
                    <IonList>
                        {predictions.map(({name, driverOrder}) =>
                            <PredictionListItem key={name} name={name} driverOrder={driverOrder}
                                                onEdit={name => history.push(`/prediction/${name}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch predictions'}</div>
                )}
                <IonInfiniteScroll threshold="33%" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more predictions...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={addNewPrediction}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default PredictionList;
