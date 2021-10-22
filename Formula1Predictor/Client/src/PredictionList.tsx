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
import {ItemContext} from './PredictionProvider';

const PredictionList: React.FC<RouteComponentProps> = ({history}) => {
    const {predictions, fetching, fetchingError} = useContext(ItemContext);
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
                        {predictions.map(({name, text}) =>
                            <PredictionListItem key={name} name={name} text={text}
                                  onEdit={name => history.push(`/prediction/${name}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch predictions'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/prediction')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default PredictionList;
