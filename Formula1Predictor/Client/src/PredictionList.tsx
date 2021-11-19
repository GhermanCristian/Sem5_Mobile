import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel,
    IonList, IonLoading,
    IonPage, IonSearchbar, IonSelect,
    IonSelectOption,
    IonTitle, IonToast,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import PredictionListItem from './PredictionListItem';
import {Network} from "@capacitor/network";
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
                        {visibleItems?.map(({_id, name, driverOrder, webViewPath}) =>
                            <PredictionListItem key={_id} name={name} driverOrder={driverOrder} _id={_id} webViewPath={webViewPath}
                                                onEdit={name => history.push(`/prediction/${name}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch predictions'}</div>
                )}

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={async () => await createPrediction(token)}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={() => logout?.()}>
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
};

export default PredictionList;
