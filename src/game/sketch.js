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


export const preload = function () {
  addBackgrounds(gameState.layers, this.loadImage)

  Promise.all([
    addCharacters({}, this.loadImage),
    addEnvironmentObjects({}, this.loadImage),
    addUfo({}, this.loadImage)
  ]).then(([characters, field, ufo]) => {
    _.set(gameState, 'characters', characters.pop());
    _.set(gameState, 'field', new Field(this, field.pop()));
  _.set(gameState, 'ufo', new Ufo(this, {...ufo, gameState}))
  })
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
    // create players test
    _.set(gameState, 'players', Object.keys(gameState.characters).map((username, id) => new Character(this, {
      gameState,
      id,
      username,
      config: gameState.characters[username]
    })))

    const button = this.createButton('roll');
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

  gameState.players.forEach(p => p.render())

  gameState.ufo.render();

  this.pop();

  // if (gameState.gameOver) {
  //   this.noLoop();
  // }
}
