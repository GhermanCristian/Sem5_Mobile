import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    createAnimation, IonButton,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel,
    IonList, IonLoading, IonModal,
    IonPage, IonSearchbar, IonSelect,
    IonSelectOption,
    IonTitle, IonToast,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import PredictionListItem from './PredictionListItem';
import {Network} from "@capacitor/core";
import {AuthContext} from "./auth";
import {PredictionContext} from "./PredictionProvider";
import {Prediction} from "./Prediction";
import {createPrediction} from "./PredictionAPI";

const offset = 5;

const PredictionList: React.FC<RouteComponentProps> = ({history}) => {
    const { logout, token } = useContext(AuthContext);
    const {predictions, fetching, fetchingError} = useContext(PredictionContext);
    const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
    const [visibleItems, setVisibleItems] = useState<Prediction[] | undefined>([]);
    const [page, setPage] = useState(offset)
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [status, setStatus] = useState<boolean>(true);
    const {savedOffline} = useContext(PredictionContext);
    const [showModal, setShowModal] = useState(false);

    const driverNames = ["None", "Hamilton", "Bottas", "Verstappen", "Perez", "Sainz", "Leclerc", "Norris", "Ricciardo", "Vettel", "Stroll", "Alonso", "Ocon", "Gasly",
        "Tsunoda", "Russell", "Latifi", "Raikkonen", "Giovinazzi", "Schumacher", "Mazepin"];
    // TODO - get this from the server

    Network.getStatus().then(status => setStatus(status.connected));
    Network.addListener('networkStatusChange', (status) => {
        setStatus(status.connected);
    });

    useEffect(() => {
        if (predictions?.length && predictions?.length > 0) {
            setPage(offset);
            fetchData();
            console.log(predictions);
        }
    }, [predictions]);

    useEffect(() => {
        if (filter === "None") {
            setVisibleItems(predictions);
        }
        else if (predictions && filter) {
            setVisibleItems(predictions.filter(prediction => prediction.driverOrder[0] === filter));
        }
    }, [filter]);

    useEffect(() => {
        if (search === "") {
            setVisibleItems(predictions);
        }
        if (predictions && search !== "") {
            setVisibleItems(predictions.filter(prediction => prediction.name?.toLowerCase().includes(search.toLowerCase())));
        }
    }, [search])

    function fetchData() {
        setVisibleItems(predictions?.slice(0, page + offset));
        setPage(page + offset);
        if (predictions && page > predictions?.length) {
            setDisabledInfiniteScroll(true);
            setPage(predictions.length);
        }
        else {
            setDisabledInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    async function onAddPredictionButtonClick() {
        setShowModal(true);
        try {
            await createPrediction(token);
        }
        catch (e) {
            console.log(e);
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Predictions</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSelect style={{ width: '40%' }} value={filter} placeholder="Pick a driver" onIonChange={(e) => setFilter(e.detail.value)}>
                    {driverNames.map((driverName) => (
                        <IonSelectOption key={driverName} value={driverName}>
                            {driverName}
                        </IonSelectOption>
                    ))}
                </IonSelect>
                <IonSearchbar style={{ width: '50%' }} placeholder="Search race" value={search} debounce={200} onIonChange={(e) => setSearch(e.detail.value!)}></IonSearchbar>
                <IonChip>
                    <IonLabel color={status? "success" : "danger"}>{status? "Online" : "Offline"}</IonLabel>
                </IonChip>
                <IonLoading isOpen={fetching} message="Fetching predictions"/>
                {predictions && (
                    <IonList>
                        {visibleItems?.map(({_id, name, driverOrder, webViewPath, latitude, longitude}) =>
                            <PredictionListItem key={_id} name={name} driverOrder={driverOrder} webViewPath={webViewPath} _id={_id} latitude={latitude} longitude={longitude}
                                                onEdit={name => history.push(`/prediction/${name}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch predictions'}</div>
                )}

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>

                <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                    <p>A new prediction has been added</p>
                    <IonButton onClick={() => {
                        setShowModal(false);
                        history.push("/");
                    }}>Close</IonButton>
                </IonModal>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={async () => onAddPredictionButtonClick()}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onMouseEnter={animateLogoutButtonOnEnter} onMouseLeave={animateLogoutButtonOnLeave} className={"logoutButton"} onClick={() => logout?.()}>
                        Logout
                    </IonFabButton>
                </IonFab>
                <IonToast
                    isOpen={!!savedOffline}
                    message="Your changes will be visible on server when you get back online!"
                    duration={2000}/>
            </IonContent>
        </IonPage>
    );

    function animateLogoutButtonOnEnter() {
        const logoutButton = document.querySelector('.logoutButton');
        if (logoutButton) {
            const animation = createAnimation()
                .addElement(logoutButton)
                .duration(500)
                .direction('alternate')
                .keyframes([
                    { offset: 0, transform: 'scale(1)', opacity: '1' },
                    { offset: 0.5, transform: 'scale(2)', opacity: '0.5' },
                    { offset: 1, transform: 'scale(3)', opacity: '1' }
                ]);
            animation.play();
        }
    }

    function animateLogoutButtonOnLeave() {
        const logoutButton = document.querySelector('.logoutButton');
        if (logoutButton) {
            const animation = createAnimation()
                .addElement(logoutButton)
                .duration(500)
                .direction('alternate')
                .keyframes([
                    { offset: 0, transform: 'scale(3)', opacity: '1' },
                    { offset: 0.5, transform: 'scale(2)', opacity: '0.5' },
                    { offset: 1, transform: 'scale(1)', opacity: '1' }
                ]);
            animation.play();
        }
    }
};

export default PredictionList;
