import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem, IonLabel,
    IonLoading,
    IonPage, IonReorder, IonReorderGroup, IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {PredictionContext} from './PredictionProvider';
import {RouteComponentProps} from 'react-router';
import {Prediction} from './Prediction';
import { ItemReorderEventDetail } from '@ionic/core';

interface PredictionEditProps extends RouteComponentProps<{
    name?: string;
}> {
}

const PredictionEdit: React.FC<PredictionEditProps> = ({history, match}) => {
    const {predictions, saving, savingError, savePrediction} = useContext(PredictionContext);
    const [driverOrder, setDriverOrder] = useState<string[]>([]);
    const [prediction, setPrediction] = useState<Prediction>();

    useEffect(() => {
        const predictionName = match.params.name || '';
        const prediction = predictions?.find(it => it.name === predictionName);
        setPrediction(prediction);
        if (prediction) {
            setDriverOrder(prediction.driverOrder);
        }
    }, [match.params.name, predictions]);

    const handleSave = () => {
        const editedPrediction = prediction ? {...prediction, driverOrder} : {driverOrder};
        savePrediction && savePrediction(editedPrediction).then(() => history.goBack());
    };

    const reorderDrivers = (event: CustomEvent<ItemReorderEventDetail>) => {
        const driverMove = prediction ? prediction.driverOrder.splice(event.detail.from, 1)[0] : '';
        prediction?.driverOrder.splice(event.detail.to, 0, driverMove);
        event.detail.complete();
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit prediction</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={history.goBack}>
                            Go back to main page
                        </IonButton>
                        <IonButton onClick={handleSave}>
                            Save prediction
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLabel>Race: {prediction?.name}</IonLabel>
                <IonRow style={{height: "15px"}}></IonRow>
                <IonLabel>Standings</IonLabel>
                <IonReorderGroup disabled={false} onIonItemReorder={reorderDrivers}>{
                    prediction?.driverOrder.map((driverName) =>
                        <IonReorder>
                            <IonItem>
                                <IonLabel>{driverName}</IonLabel>
                            </IonItem>
                        </IonReorder>
                        )
                }</IonReorderGroup>

                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save prediction'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default PredictionEdit;
