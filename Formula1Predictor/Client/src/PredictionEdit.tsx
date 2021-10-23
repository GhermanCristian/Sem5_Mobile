import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonLabel, IonList,
    IonLoading,
    IonPage, IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {PredictionContext} from './PredictionProvider';
import {RouteComponentProps} from 'react-router';
import {Prediction} from './Prediction';

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
                <IonList>{
                    prediction?.driverOrder.map((driverName) =>
                        <IonItem>
                            <IonLabel>{driverName}</IonLabel>
                        </IonItem>
                        )
                }</IonList>

                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save prediction'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default PredictionEdit;
