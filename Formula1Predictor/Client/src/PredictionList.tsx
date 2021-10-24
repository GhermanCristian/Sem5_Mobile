import React, {useContext} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import PredictionListItem from './PredictionListItem';
import {PredictionContext} from './PredictionProvider';
import {createPrediction} from "./PredictionAPI";

const PredictionList: React.FC<RouteComponentProps> = ({history}) => {
    const {predictions, fetching, fetchingError} = useContext(PredictionContext);

    const addNewPrediction = async () => {
        await createPrediction();
        history.push('/'); // reload page
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
