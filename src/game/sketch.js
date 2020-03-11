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

import {
  createGame,
  getPlayersByRef,
} from '../database/common';

export const create = ({
  setup,
  draw,
  preload,
  wrapper
}) => new p5((p) => {
  p.setup   = setup.bind(p);
  p.draw    = draw.bind(p);
  p.preload = preload.bind(p);
}, wrapper)


const gameState = {
  status: GAME_STATE.waiting,
  counter: 0,
  layers: [],
  players: [],
  animation: {
    background: [1, 3, 6],
  },
  characters: {},
  ufo: null,
  field: null,
  gameOver: false,
}

let ref = null;

const onPlayers = (rend) => ({docs}) => {
  if (!gameState.players.length) {
    // initial
    return _.set(gameState, 'players', docs.map((pl, index) => {
      const player = pl.data();
      return new Character(rend, {
        gameState,
        id: player.id,
        spot: player.spot,
        username: player.username,
        config: gameState.characters[player.username]
      })
    }));
  }


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

  ref = await createGame(gameState)
  const playersRef = getPlayersByRef(ref.document);

  playersRef.onSnapshot(onPlayers(this))
}

export const setup = function () {
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
    const button2 = this.createButton('create user');

    button.mousePressed(() => {
      const rollData = {
        // roll: 1,
        roll: Math.floor(Math.random() * 6) + 1,
        player: gameState.counter % gameState.players.length
      }

      gameState.players[rollData.player].move(rollData.roll);
      gameState.counter += 1;
    });
  }

}

export const draw = function () {
  this.background(0)

  gameState.layers.forEach(l => l.play())

  this.push();
  this.translate(ONSCREEN_OFFSET, FIELD_OFFSET + 1);

  gameState.field.render();

  if (gameState.status !== GAME_STATE.waiting) {
    gameState.players.forEach(p => p.render())
  } else {
    // render logo and qr
  }


  gameState.ufo.render();

  this.pop();

  // if (gameState.gameOver) {
  //   this.noLoop();
  // }
}
