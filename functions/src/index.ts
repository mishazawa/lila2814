import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initialGameState } from './utils';
import { MAX_PLAYERS } from './constants';


admin.initializeApp({});

/*
   __ _  __ _ _ __ ___   ___
  / _` |/ _` | '_ ` _ \ / _ \
 | (_| | (_| | | | | | |  __/
  \__, |\__,_|_| |_| |_|\___|
   __/ |
  |___/
*/

const firestore = admin.firestore();


export const createGame = functions.https.onCall(async (data, context) => {
  const game = firestore.collection('games').doc();
  const gameData = initialGameState(game.id, admin.firestore.FieldValue.serverTimestamp())
  await game.set(gameData);
  return gameData;
});

export const getGame = functions.https.onCall(async (data, context) => {
  if (!data.id) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Function should be called with {id: string}');
  }

  const game = await firestore.collection('games').doc(data.id).get();

  if (!game.exists) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Game doesn\'t exists.');
  }


  return game.data();
});

export const updateGame = functions.https.onCall((data, context) => {
  return {}
});

export const endGame = functions.https.onCall((data, context) => {
  return {}
});

/*
       | |
  _ __ | | __ _ _   _  ___ _ __
 | '_ \| |/ _` | | | |/ _ \ '__|
 | |_) | | (_| | |_| |  __/ |
 | .__/|_|\__,_|\__, |\___|_|
 | |             __/ |
 |_|            |___/
*/

export const createPlayer = functions.https.onCall(async (data, context) => {
  const { username, gameId } = data;

  if (!username || !gameId) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Function should be called with { username: string, gameId: string }');
  }

  const game = await firestore.collection('games').doc(gameId).get();

  if (!game.exists) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Game doesn\'t exists.');
  }

  const player = game.ref.collection('players').doc()


  await firestore.runTransaction(async (tr: admin.firestore.Transaction) => {
    const players = await tr.get(game.ref.collection('players'))

    if (players.size >= MAX_PLAYERS) return null;

    return tr.set(player, {
      username,
      id: player.id,
      ref: player,
      queueOrder: players.size,
    });
  })


  const playerData = await player.get();

  return playerData.data();
});

export const getPlayer = functions.https.onCall(async (data, context) => {
  const { playerId, gameId } = data;

  if (!playerId || !gameId) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Function should be called with { playerId: string, gameId: string }');
  }

  const game = await firestore.collection('games').doc(gameId).get();

  if (!game.exists) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Game doesn\'t exists.');
  }

  const player = await game.ref.collection('players').doc(playerId).get();

  if (!player.exists) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Player doesn\'t exists.');
  }

  return player.data();
});

export const updatePlayer = functions.https.onCall((data, context) => {
  return {}

});

/*
   ___ ___  _ __ ___  _ __ ___   ___  _ __
  / __/ _ \| '_ ` _ \| '_ ` _ \ / _ \| '_ \
 | (_| (_) | | | | | | | | | | | (_) | | | |
  \___\___/|_| |_| |_|_| |_| |_|\___/|_| |_|
*/

export const roll = functions.https.onCall((data, context) => {
  return {}
});
