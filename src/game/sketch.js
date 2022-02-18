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

const MAX_SPOT    = 99;

const randomRoll = () => Math.floor(Math.random() * 6) + 1
const getStatus = (spot) => spot > MAX_SPOT ? GAME_STATE.gameOver : GAME_STATE.waitingForRoll;
const gameOver = () => {

}

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

  const chars = _.shuffle(['pink', 'blue', 'red', 'yellow'])

  const button = this.createButton('roll');
  const button2 = this.createButton('create player');
  const button3 = this.createButton('start game');

  button.mousePressed(() => {
    if (gameState.status !== GAME_STATE.waitingForRoll) return;

    const next = gameState.counter % Object.keys(gameState.players).length;
    const player = _.find(gameState.players, (pl) => pl.queueOrder === next)
    
    if (!player) return;
    
    const nextStatus = {
      status: GAME_STATE.moving,
      roll: {
        next,
        roll: randomRoll()
      }
    };

    const prevStatus = {
      status: gameState.status,
    };

    setGameState({
      status: GAME_STATE.moving
    });
    
    applyRoll(prevStatus, nextStatus)((player, roll) => player.setNewSpot(roll).then((spot) => {
      setGameState({
        status: getStatus(spot),
        counter: gameState.counter + 1,
      })
    }).catch(() => {
      setGameState({
        status: GAME_STATE.gameOver,
        counter: gameState.counter + 1,
      })
      gameOver()
    }));
  });


  button2.mousePressed(() => {
    const queueOrder = Object.keys(gameState.players).length;
    const id = 'test_player' + queueOrder;
    const pl = {
      id,
      username: id,
      queueOrder,
      spot: 0,
    }
    _.set(gameState.players, pl.id, instPlayer(this, pl, chars));
  });

  button3.mousePressed(() => {
    if (Object.keys(gameState.players).length < 2) return;
    _.set(gameState, "status", GAME_STATE.waitingForRoll);
  })
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
}


const setGameState = (update) => {
  _.assignIn(gameState, update);
}

const instPlayer = (renderer, data, chars) => new Character(renderer, {
  gameState,
  id: data.id,
  spot: data.spot || 0,
  username: data.username,
  queueOrder: data.queueOrder,
  skin_id: chars[data.queueOrder],
  config: gameState.characters[chars[data.queueOrder]]
})

const applyRoll = (prev, next) => (fn) => {
  if (prev.status === GAME_STATE.waitingForRoll && next.status === GAME_STATE.moving) {
    const roll = next.roll;
    const player = _.find(gameState.players, (pl) => pl.queueOrder === roll.next)
    if (player) return fn(player, roll.roll);
  }
}

