import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
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
    const [text, setText] = useState('');
    const [prediction, setPrediction] = useState<Prediction>();

    useEffect(() => {
        const routeName = match.params.name || '';
        const prediction = predictions?.find(it => it.name === routeName);
        setPrediction(prediction);
        if (prediction) {
            setText(prediction.text);
        }
    }, [match.params.name, predictions]);

    const handleSave = () => {
        const editedPrediction = prediction ? {...prediction, text} : {text};
        savePrediction && savePrediction(editedPrediction).then(() => history.goBack());
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save prediction
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput value={text} onIonChange={elem => setText(elem.detail.value || '')}/>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save prediction'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default PredictionEdit;
