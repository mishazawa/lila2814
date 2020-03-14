import * as p5 from 'p5';
import _ from 'lodash';

import {
  FRAMERATE,
  ANIMATION_SPEED_SKY,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  ONSCREEN_OFFSET,
  FIELD_OFFSET,
  TILE_SIZE,
  DEBUG,
  GAME_STATE,
} from './constants';

import { Animation } from './utils/Animation';
import { Field }     from './utils/Field';
import { Character } from './utils/Character';
import { Ufo }       from './utils/Ufo';

import {
  addBackgrounds,
  createAnimationsForBackgroundLayers,
  addEnvironmentObjects,
  addCharacters,
  addUfo,
} from './loadAssets';

import { app as Firebase } from '../database/common';

export const create = ({
  setup,
  draw,
  preload,
  wrapper,
  ...args
}) => new p5((p) => {
  p.setup   = setup.bind(p);
  p.draw    = draw.bind(p);
  p.preload = preload.bind(p);
  _.assignIn(p, args)
}, wrapper)


const gameState = {
  counter: 0,
  layers: [],
  players: {},
  animation: {
    background: [1, 3, 6],
  },
  characters: {},
  ufo: null,
  field: null,
  gameOver: false,
  connectionHandler: () => {}
}

export const preload = async function () {
  addBackgrounds(gameState.layers, this.loadImage)

  const [characters, field, ufo] = await Promise.all([
    addCharacters({}, this.loadImage),
    addEnvironmentObjects({}, this.loadImage),
    addUfo({}, this.loadImage),
  ]);

  _.set(gameState, 'characters', characters.pop());
  _.set(gameState, 'field', new Field(this, field.pop()));
  _.set(gameState, 'ufo', new Ufo(this, {...ufo, gameState}))

}

export const setup = async function () {
  this.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  this.frameRate(FRAMERATE);
  this.noSmooth();

  _.set(gameState, 'layers', gameState.layers.map((layer) => new Animation(this, {
    layer,
    position: {
      x: ONSCREEN_OFFSET - TILE_SIZE,
      y: 0
    }
  })));


  createAnimationsForBackgroundLayers(gameState, ANIMATION_SPEED_SKY);

  if (DEBUG) {
    const button = this.createButton('roll');

    button.mousePressed(() => {
      const rollData = {
        // roll: 1,
        roll: Math.floor(Math.random() * 6) + 1,
        player: gameState.counter % Object.keys(gameState.players).length
      }

      const key = Object.keys(gameState.players)[rollData.player]

      gameState.players[key].move(rollData.roll);
      gameState.counter += 1;
    });
  }


  const chars = _.shuffle(['pink', 'blue', 'red', 'yellow'])
  const players = await Firebase.getPlayers(this.data.id).get()

  // restore players
  players.docs.forEach((pl) => {
    const player = pl.data();
    _.set(gameState.players, player.id, instPlayer(this, player, chars));
  });

  Firebase.getGame(this.data.id).onSnapshot((snapshot) => {
    const next = snapshot.data()
    const prev = gameState;

    if (next.status === GAME_STATE.waiting) {

      // wait for new players (ignore already restored users)
      gameState.connectionHandler = Firebase.getPlayers(this.data.id).onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const player = change.doc.data();
            if (gameState.players[player.id]) return;
            _.set(gameState.players, player.id, instPlayer(this, player, chars));
          }
        });
      });
    }

    if (prev.status !== next.status && prev.status === GAME_STATE.waiting) {
      console.log('switch to game')
      gameState.connectionHandler();
    }

    setGameState(next);
  });


}

export const draw = function () {
  this.background(0)

  gameState.layers.forEach(l => l.play())

  this.push();
  this.translate(ONSCREEN_OFFSET, FIELD_OFFSET + 1);

  gameState.field.render();


  for (let p in gameState.players) {
    gameState.players[p].render()
  }


  gameState.ufo.render();

  this.pop();

  // if (gameState.gameOver) {
  //   this.noLoop();
  // }
}


const setGameState = (update) => {
  _.assignIn(gameState, update);
}

const instPlayer = (renderer, data, chars) => new Character(renderer, {
  gameState,
  id: data.id,
  spot: data.spot || 0,
  username: data.username,
  skin_id: chars[data.queueOrder],
  config: gameState.characters[chars[data.queueOrder]]
})
