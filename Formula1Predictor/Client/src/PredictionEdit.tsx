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
import {ItemReorderEventDetail} from '@ionic/core';
import {usePhotoGallery} from "./usePhotoGallery";
import {MyMap} from "./MyMap";

interface PredictionEditProps extends RouteComponentProps<{
    name?: string;
}> {
}

const PredictionEdit: React.FC<PredictionEditProps> = ({history, match}) => {
    const {predictions, saving, savingError, savePrediction} = useContext(PredictionContext);
    const [driverOrder, setDriverOrder] = useState<string[]>([]);
    const [prediction, setPrediction] = useState<Prediction>();
    const [webViewPath, setWebViewPath] = useState('');
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
    const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);

    const {latitude : lat, longitude : lng} = {latitude: 44.937612, longitude: 13.851877};

    const {takePhoto} = usePhotoGallery();

    useEffect(() => {
        const predictionName = match.params.name || '';
        const prediction = predictions?.find(it => it.name === predictionName);
        setPrediction(prediction);
        if (prediction) {
            setDriverOrder(prediction.driverOrder);
            setWebViewPath(prediction.webViewPath);
            setLatitude(prediction.latitude);
            setLongitude(prediction.longitude);
        }
    }, [match.params.name, predictions]);

    useEffect(() => {
        if (latitude === undefined && longitude === undefined) {
            setCurrentLatitude(lat);
            setCurrentLongitude(lng);
        }
        else {
            setCurrentLatitude(latitude);
            setCurrentLongitude(longitude);
        }
    }, [lat, lng, longitude, latitude]);

    const handleSave = () => {
        const editedPrediction = prediction ? {...prediction, driverOrder, webViewPath, latitude, longitude} : {driverOrder, webViewPath, latitude, longitude};
        savePrediction && savePrediction(editedPrediction).then(() => history.goBack());
    };

    const reorderDrivers = (event: CustomEvent<ItemReorderEventDetail>) => {
        const driverMove = prediction ? prediction.driverOrder.splice(event.detail.from, 1)[0] : '';
        prediction?.driverOrder.splice(event.detail.to, 0, driverMove);
        event.detail.complete();
    }

    async function handlePhotoChange() {
        const image = await takePhoto();
        if (!image) {
            setWebViewPath('');
        }
        else {
            setWebViewPath(image);
        }
    }

    function setLocation() {
        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
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
                {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'100px'} height={'100px'}/>)}
                {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}

                <IonRow style={{height: "15px"}}></IonRow>

                <IonItem>
                    <IonLabel>Do you know geography ?</IonLabel>
                    <IonButton onClick={setLocation}>Set location</IonButton>
                </IonItem>

                {lat && lng &&
                <MyMap
                    lat={currentLatitude}
                    lng={currentLongitude}
                    onMapClick={(e: any) => onClick(e)}
                    onMarkerClick={(e: any) => onClick(e)}
                />
                }
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

    function onClick(e: any) {
        setLatitude(e.latLng.lat());
        setLongitude(e.latLng.lng());
    }
};

export default PredictionEdit;
