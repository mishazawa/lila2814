import * as p5 from 'p5';
import _ from 'lodash';

import { FRAMERATE, ANIMATION_SPEED_SKY, SCREEN_WIDTH, SCREEN_HEIGHT, ONSCREEN_OFFSET, FIELD_OFFSET } from './constants';


import { Animation } from './utils/Animation';
import { Field } from './utils/Field';

import {
  addBackgrounds,
  createAnimationsForBackgroundLayers,
  addEnvironmentObjects,
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
  animation: {
    background: [1, 3, 6],
  }
}


export const preload = function () {
  addBackgrounds(gameState.layers, this.loadImage)

  addEnvironmentObjects({}, this.loadImage).then(([data]) => {
    _.set(gameState, 'field', new Field(this, data));
  });
}

export const setup = function () {
  this.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  this.frameRate(FRAMERATE);
  this.noSmooth();

  _.set(gameState, 'layers', gameState.layers.map((layer) => new Animation(this, {
    layer,
    position: {
      x: SCREEN_WIDTH / 4,
      y: 0
    }
  })));

  createAnimationsForBackgroundLayers(gameState, ANIMATION_SPEED_SKY);
}

export const draw = function () {
  this.background(0)

  gameState.layers.map(l => l.play())

  this.push();
  this.translate(ONSCREEN_OFFSET, FIELD_OFFSET + 1);

  gameState.field.render();

  this.pop();
}
