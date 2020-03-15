import * as firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/functions';

import { firebaseConfig } from './config';

export let app: Firebase;

export const init = () => {
  if (!firebase.apps.length) {
    app = new Firebase(firebase.initializeApp(firebaseConfig))
  } else {
    app = new Firebase(firebase.apps[0]);
  }
}

interface Firebase {
  app: firebase.app.App;
}

class Firebase implements Firebase {

  constructor (app: firebase.app.App) {
    this.app = app;
  }

  getFirestore = (): firebase.firestore.Firestore => this.app.firestore()
  callFn = (id: string, data: any): Promise<any> => this.app.functions().httpsCallable(id)(data)

  getGame = (id: string): firebase.firestore.DocumentReference => this.getFirestore().doc(`games/${id}`)

  getPlayers = (id: string): firebase.firestore.CollectionReference => this.getFirestore().collection(`games/${id}/players`)

}
