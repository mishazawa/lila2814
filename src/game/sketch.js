import * as p5 from 'p5';
import _ from 'lodash';

import { FRAMERATE, ANIMATION_SPEED_SKY, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';


import { Animation } from './utils/Animation';
import { Field } from './utils/Field';

import {
  addBackgrounds,
  createAnimationsForBackgroundLayers
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
    portals: {
      green: {},
      red: {},
      placeholder: {}
    }
  }
}


export const preload = function () {
  addBackgrounds(gameState.layers, this.loadImage)
}

export const setup = function () {
  this.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
  this.frameRate(FRAMERATE);
  this.noSmooth();

  _.assign(gameState.layers, gameState.layers.map((layer) => new Animation(this, {
    layer,
    position: {
      x: SCREEN_WIDTH / 4,
      y: 0
    }
  })));

  createAnimationsForBackgroundLayers(gameState, ANIMATION_SPEED_SKY);

  const f = new Field(this, {
      // portal_green: game.animation.portal_green,
      // portal_red: game.animation.portal_red,
      // red_light: game.animation.red_light,
      // green_light: game.animation.green_light,
      // idle: game.animation.idle
  })

  gameState.field = f.create();

}
export const draw = function () {
  this.background(0)
  gameState.layers.map(l => l.play())
}
