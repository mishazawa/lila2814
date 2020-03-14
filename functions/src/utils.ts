import * as admin from 'firebase-admin';
import { MAX_SPOT, GAME_STATE } from './constants';


export const initialGameState = (id: string, created: admin.firestore.FieldValue) => ({
  id,
  created,
  counter: 0,
  status: GAME_STATE.waiting
});


export const randomRoll = () => Math.floor(Math.random() * 6) + 1

export const getStatus = (spot: number) => spot >= MAX_SPOT ? GAME_STATE.gameOver : GAME_STATE.waitingForRoll;
