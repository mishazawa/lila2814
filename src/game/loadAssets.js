import _ from 'lodash';

import { TILE_SIZE, UFO_TILE_WIDTH, UFO_TILE_HEIGHT } from './constants'

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

// characters

import pink_idle   from '../assets/characters/pink/idle.png'
import pink_walk   from '../assets/characters/pink/walk.png'
import pink_config from '../assets/characters/pink/config.json'

import yell_idle   from '../assets/characters/yellow/idle.png';
import yell_walk   from '../assets/characters/yellow/walk.png';
import yell_config from '../assets/characters/yellow/config.json'

import blue_idle   from '../assets/characters/blue/idle.png'
import blue_walk   from '../assets/characters/blue/walk.png'
import blue_config from '../assets/characters/blue/config.json'

import red_idle    from '../assets/characters/red/idle.png';
import red_walk    from '../assets/characters/red/walk.png';
import red_config  from '../assets/characters/red/config.json'

// ufo

import ufo_sprite  from '../assets/ambient/ufo/ufo.png'
import ufo_config  from '../assets/ambient/ufo/config.json'



const loadSprite = (loadImage, destination) => (file, name) => new Promise(res => loadImage(file, (img) => {
  if (img.width === TILE_SIZE) {
    _.set(destination, name, img);
  } else {
    _.set(destination, name, _.times(img.width / TILE_SIZE, (i) => img.get(TILE_SIZE * i, 0, TILE_SIZE, TILE_SIZE)));
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
  const load = loadSprite(loadFn, destination);

  _.set(destination, 'red.config', red_config);
  _.set(destination, 'pink.config', pink_config);
  _.set(destination, 'blue.config', blue_config);
  _.set(destination, 'yellow.config', yell_config);

  return Promise.all([
    load(pink_idle, 'pink.idle'),
    load(pink_walk, 'pink.walk'),
    load(yell_idle, 'yellow.idle'),
    load(yell_walk, 'yellow.walk'),
    load(red_idle,  'red.idle'),
    load(red_walk,  'red.walk'),
    load(blue_idle, 'blue.idle'),
    load(blue_walk, 'blue.walk')
  ]);
}

export const addUfo = (destination, loadFn) => new Promise((res) => loadFn(ufo_sprite, (img) => {
  _.set(destination, 'config', ufo_config);
  _.set(destination, 'skin', _.times(img.width / UFO_TILE_WIDTH, (i) => img.get(UFO_TILE_WIDTH * i, 0, UFO_TILE_WIDTH, UFO_TILE_HEIGHT)));
  return res(destination)
}))

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
