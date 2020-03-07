import * as firebase from "firebase/app";
import 'firebase/firestore';
import { firebaseConfig } from './config';

let app: firebase.app.App;
let firestore: firebase.firestore.Firestore;

export const getFirestore = (): firebase.firestore.Firestore => app.firestore();

export const init = () => {
  app = firebase.initializeApp(firebaseConfig);
  firestore = getFirestore();
}
