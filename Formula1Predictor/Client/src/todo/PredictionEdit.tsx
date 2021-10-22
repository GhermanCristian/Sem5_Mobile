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
import {getLogger} from '../core';
import {ItemContext} from './ItemProvider';
import {RouteComponentProps} from 'react-router';
import {Prediction} from './Prediction';

const log = getLogger('PredictionEdit');

interface PredictionEditProps extends RouteComponentProps<{
    name?: string;
}> {
}

const PredictionEdit: React.FC<PredictionEditProps> = ({history, match}) => {
    const {items, saving, savingError, saveItem} = useContext(ItemContext);
    const [text, setText] = useState('');
    const [item, setItem] = useState<Prediction>();

    useEffect(() => {
        log('useEffect');
        const routeName = match.params.name || '';
        const item = items?.find(it => it.name === routeName);
        setItem(item);
        if (item) {
            setText(item.text);
        }
    }, [match.params.name, items]);

    const handleSave = () => {
        const editedItem = item ? {...item, text} : {text};
        saveItem && saveItem(editedItem).then(() => history.goBack());
    };

    log('render');
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
