import * as p5 from 'p5';
import _ from 'lodash';

import { FRAMERATE, ANIMATION_SPEED_SKY, FIELD_SIZE, TILE_SIZE } from './constants';


import { Animation } from './utils/Animation';


import {
  addBackgrounds
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
    layers: [1, 3, 6]
  }
}


export const preload = function () {
  addBackgrounds(gameState.layers, this.loadImage)
}

export const setup = function () {
  this.createCanvas(FIELD_SIZE + TILE_SIZE * 2, FIELD_SIZE + TILE_SIZE * 2);
  this.frameRate(FRAMERATE);
  this.noSmooth();

  _.assign(gameState.layers, gameState.layers.map((layer) => new Animation(this, {
    layer,
    position: {
      x: 0,
      y: 0
    },
    render () {
      if (this.position.x >= this.layer.width) this.position.x = 0;
      if (this.position.x > 0) {
        // draw tail of image
        this.renderer.image(this.layer, this.position.x - this.layer.width, 0);
      }
      // draw head of image
      this.renderer.image(this.layer, this.position.x, 0);
    }
  })));

  [gameState.layers[1], gameState.layers[3], gameState.layers[5]].forEach((layer, i) => {
    layer.update = function () {
      this.position.x += gameState.animation.layers[i] * ANIMATION_SPEED_SKY;
    }
  });

}
export const draw = function () {
  this.background(12)
  gameState.layers.map(l => l.play())
}
