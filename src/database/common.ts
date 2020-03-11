import * as firebase from "firebase/app";
import 'firebase/firestore';
import { firebaseConfig } from './config';
import nanoid from 'nanoid';
import _ from 'lodash';

let app: firebase.app.App;
let firestore: firebase.firestore.Firestore;

const GAMES = 'games';
const PLAYERS = 'players';

const omitGame = (gs: any) => _.pick(gs, ['status', 'counter', 'gameOver'])
const omitPlayer = (pd: any) => _.pick(pd, ['id', 'spot', 'username'])
export const getFirestore = (): firebase.firestore.Firestore => app.firestore();

export const init = () => {
  app = firebase.initializeApp(firebaseConfig);
  firestore = getFirestore();
}

export const createGame = async (data: any) => {
  const id = nanoid()
  const document = getFirestore().collection(GAMES).doc(id);
  await document.set({ id, ...omitGame(data) })
  return { id, document };
}

export const connectPlayer = async (gameId: string, playerData: any) => {
  const document = getFirestore().collection(GAMES).doc(gameId).collection(PLAYERS).doc(playerData.id);
  await document.set(omitPlayer(playerData))
  return { id: playerData.id, document };
}


export const getPlayers = (gameId: string) =>  getFirestore().collection(GAMES).doc(gameId).collection(PLAYERS);
export const getPlayersByRef = (doc: firebase.firestore.DocumentReference) =>  doc.collection(PLAYERS);
