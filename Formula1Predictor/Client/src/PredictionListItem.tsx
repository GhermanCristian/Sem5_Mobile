import React from 'react';
import {IonItem, IonLabel} from '@ionic/react';
import {Prediction} from './Prediction';

interface PredictionExt extends Prediction {
    onEdit: (name?: string) => void;
}

const PredictionListItem: React.FC<PredictionExt> = ({name, driverOrder, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(name)}>
            <IonLabel>{name} - Winner: {driverOrder[0]}</IonLabel>
        </IonItem>
    );
};

export default PredictionListItem;
