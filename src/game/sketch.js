import * as p5 from 'p5';
import _ from 'lodash';

import {
  FRAMERATE,
  ANIMATION_SPEED_SKY,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  ONSCREEN_OFFSET,
  FIELD_OFFSET,
  TILE_SIZE
} from './constants';

import { Animation } from './utils/Animation';
import { Field }     from './utils/Field';
import { Character } from './utils/Character';

import {
  addBackgrounds,
  createAnimationsForBackgroundLayers,
  addEnvironmentObjects,
  addCharacters,
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
  layers: [],
  players: [],
  animation: {
    background: [1, 3, 6],
  },
  characters: {},
  field: null
}


export const preload = function () {
  addBackgrounds(gameState.layers, this.loadImage)

  Promise.all([
    addCharacters({}, this.loadImage),
    addEnvironmentObjects({}, this.loadImage)
  ]).then(([characters, field]) => {
    _.set(gameState, 'characters', characters.pop());
    _.set(gameState, 'field', new Field(this, field.pop()));
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


  // create players test
  _.set(gameState, 'players', Object.keys(gameState.characters).map((username, id) => new Character(this, {
    gameState,
    id,
    username,
    config: gameState.characters[username]
  })))

}

export const draw = function () {
  this.background(0)

  gameState.layers.forEach(l => l.play())

  this.push();
  this.translate(ONSCREEN_OFFSET, FIELD_OFFSET + 1);

  gameState.field.render();

  gameState.players.forEach(p => p.render())

  this.pop();
}
