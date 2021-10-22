import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { ItemProvider } from './ItemProvider';
import React from "react";
import PredictionList from "./PredictionList";
import PredictionEdit from "./PredictionEdit";

const App: React.FC = () => (
    <IonApp>
      <ItemProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/predictions" component={PredictionList} exact={true} />
            <Route path="/prediction/:name" component={PredictionEdit} exact={true} />
            <Route exact path="/" render={() => <Redirect to="/predictions" />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </ItemProvider>
    </IonApp>
);

export default App;
