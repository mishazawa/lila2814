import _ from 'lodash';

import { TILE_SIZE } from './constants'

// animated
import bg01a  from '../assets/backgrounds/bg-02.png';
import bg02a  from '../assets/backgrounds/bg-04.png';
import bg03a  from '../assets/backgrounds/bg-06.png';

// static
import bg01   from '../assets/backgrounds/bg-01.png';
import bg02   from '../assets/backgrounds/bg-03.png';
import bg03   from '../assets/backgrounds/bg-05.png';
import bg04   from '../assets/backgrounds/bg-07.png';
import bg05   from '../assets/backgrounds/bg-08.png';

// stairs
import stairs from '../assets/ambient/static/stairs.png';

// objects

import green_animation from '../assets/ambient/light/green/portal.png';
import green_light     from '../assets/ambient/light/green/light.png';
import green_mask      from '../assets/ambient/light/green/mask.png';

import red_animation   from '../assets/ambient/light/red/portal.png';
import red_light       from '../assets/ambient/light/red/light.png';
import red_mask        from '../assets/ambient/light/red/mask.png';

import portal_static   from '../assets/ambient/static/portal.png';

const loadSprite = (loadImage, destination) => (file, name) => new Promise(res => loadImage(file, (img) => {
  if (img.width === TILE_SIZE) {
    destination[name] = img;
  } else {
    destination[name] = _.times(img.width / TILE_SIZE, (i) => img.get(TILE_SIZE * i, 0, TILE_SIZE, TILE_SIZE));
  }
  return res(destination);
}));

export const addBackgrounds = (destination, loadFn) => {
  [bg01, bg01a, bg02, bg02a, bg03, bg03a, bg04, bg05, stairs].forEach((asset) => destination.push(loadFn(asset)))
}

export const addEnvironmentObjects = (destination, loadFn) => {
  const load = loadSprite(loadFn, destination);

  return Promise.all([
    load(portal_static, 'idle'),
    load(green_light,   'green_light'),
    load(red_light,     'red_light'),



    load(green_animation, 'portal_green'),
    load(green_mask,      'green_mask_anim'),
    load(red_animation,   'portal_red'),
    load(red_mask,        'red_mask_anim'),
  ]);
}

export const addCharacters = (destination, loadFn) => {

}

const INFINITE_LAYERS = [1, 3, 5]
const STATIC_COPIED_LAYERS = [0, 4, 6, 7]

export const createAnimationsForBackgroundLayers = (gameState, animationSpeedSky) => {
  // infinite layers
  INFINITE_LAYERS.forEach((layerIndex, i) => {
    gameState.layers[layerIndex].update = function () {
      this.position.x += gameState.animation.background[i] * animationSpeedSky;
    }
    gameState.layers[layerIndex].render = function () {
      if (this.position.x >= this.layer.width) this.position.x = 0;
      if (this.position.x > 0) this.renderer.image(this.layer, this.position.x - this.layer.width, 0);
      this.renderer.image(this.layer, this.position.x, 0);
    }
  })

  // copied static layers
  STATIC_COPIED_LAYERS.forEach((layerIndex) => {
    gameState.layers[layerIndex].render = function () {
      this.renderer.image(this.layer, 0, 0);
      this.renderer.image(this.layer, this.layer.width, 0);
    }
  })
}
