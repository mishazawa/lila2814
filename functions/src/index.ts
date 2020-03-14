import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initialGameState, randomRoll, getStatus } from './utils';
import { MAX_PLAYERS, GAME_STATE } from './constants';
import _ from 'lodash';


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

export const updateGame = functions.https.onCall(async (data, context) => {
  const { playerId, gameId, spot } = data;

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

  const gameData = game.data();

  if (!gameData) return null;

  if (gameData.status !== GAME_STATE.moving) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Game isn\'t in update state.');
  }

  const players = await game.ref.collection('players').get();

  const previous = gameData.counter - 1 % players.size;

  const playerSnapshot = _.find(players.docs, (doc) => {
    const player = doc.data();
    return player.queueOrder === previous && playerId === player.id;
  });

  if (!playerSnapshot) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Player shouldn\'t update game.');
  }

  const writeBatch = firestore.batch();

  writeBatch.update(playerSnapshot.ref, { spot });
  writeBatch.update(game.ref, { status: getStatus(spot) });
  await writeBatch.commit();

  return { status: getStatus(spot) }
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

  const gameData = game.data()

  if (gameData && GAME_STATE.waiting !== gameData.status) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Game already started.');
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
      spot: 0,
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

/*
   ___ ___  _ __ ___  _ __ ___   ___  _ __
  / __/ _ \| '_ ` _ \| '_ ` _ \ / _ \| '_ \
 | (_| (_) | | | | | | | | | | | (_) | | | |
  \___\___/|_| |_| |_|_| |_| |_|\___/|_| |_|
*/

export const rollDice = functions.https.onCall(async (data, context) => {
  const { gameId, playerId } = data;

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

  const gameData = game.data()

  if (!gameData) return null;

  if (GAME_STATE.waitingForRoll !== gameData.status) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Game not in roll state.');
  }

  const players = await game.ref.collection('players').get();

  const current = gameData.counter % players.size;

  const playerSnapshot = _.find(players.docs, (doc) => {
    const player = doc.data();
    return player.queueOrder === current && playerId === player.id;
  });

  if (!playerSnapshot) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Player shouldn\'t move.');
  }

  const roll = randomRoll();
  const spot = _.get(playerSnapshot.data(), 'spot', 0);

  const writeBatch = firestore.batch();
  writeBatch.set(game.ref.collection('rolls').doc(`${gameData.counter}`), { playerId, spot, roll, current });
  writeBatch.update(game.ref, { counter: admin.firestore.FieldValue.increment(1), status: GAME_STATE.moving });
  await writeBatch.commit();

  return { roll };
});
