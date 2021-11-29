import React from 'react';
import {IonItem, IonLabel} from '@ionic/react';
import {Prediction} from './Prediction';

interface PredictionExt extends Prediction {
    onEdit: (name?: string) => void;
}

const PredictionListItem: React.FC<PredictionExt> = ({name, driverOrder, webViewPath, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(name)}>
            <IonLabel>{name} - Winner: {driverOrder[0]}</IonLabel>
            <img src={webViewPath} width={'100px'} height={'100px'}/>
        </IonItem>
    );
};

export default PredictionListItem;
