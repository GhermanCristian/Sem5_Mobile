import React from 'react';
import {IonItem, IonLabel} from '@ionic/react';
import {Prediction} from './Prediction';

interface PredictionExt extends Prediction {
    onEdit: (name?: string) => void;
}

const PredictionListItem: React.FC<PredictionExt> = ({name, text, onEdit}) => {
    return (
        <IonItem onClick={() => onEdit(name)}>
            <IonLabel>{name} - {text.substring(0, 18)}</IonLabel>
        </IonItem>
    );
};

export default PredictionListItem;
