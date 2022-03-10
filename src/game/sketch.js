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
  TINT_COLOR,
  START_SPOT,
} from './constants';

import { Animation } from './utils/Animation';
import { Field }     from './utils/Field';
import { Ufo }       from './utils/Ufo';

import {
  addBackgrounds,
  addButtons,
  createAnimationsForBackgroundLayers,
  addEnvironmentObjects,
  addCharacters,
  addUfo,
} from './loadAssets';


import {
  instPlayer,
  calcButtonsPositions,
  checkPosition,
  randomRoll,
  getStatus,
  drawPlayerInit,
  drawMenuInit,
  drawGameplayInit,
  drawReplayInit,
} from './utils';


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
  menu: {
    buttons: {},
    buttons_gs: {},
  },
  players: {},
  animation: {
    background: [1, 3, 6],
  },
  characters: {},
  characters_gs: {},
  ufo: null,
  field: null,
  gameOver: false, // mb useless
  connectionHandler: () => {},
  buttonPosition: null,
};

let drawPlayer   = null;
let drawMenu     = null;
let drawGameplay = null;
let drawReplay   = null;

const chars = _.shuffle(['pink', 'blue', 'red', 'yellow'])

export const preload = async function () {
  addBackgrounds(gameState.layers, this.loadImage);

  // can't use same pictures because of filter GRAY
  addButtons(gameState.menu.buttons, this.loadImage);
  addButtons(gameState.menu.buttons_gs, this.loadImage);

  const [characters, characters_gs, field, ufo] = await Promise.all([
    addCharacters({}, this.loadImage),
    addCharacters({}, this.loadImage),
    addEnvironmentObjects({}, this.loadImage),
    addUfo({}, this.loadImage),
  ]);

  _.set(gameState, 'characters', characters.pop());
  _.set(gameState, 'characters_gs', characters_gs.pop());
  _.set(gameState, 'field', new Field(this, field.pop()));
  _.set(gameState, 'ufo', new Ufo(this, {...ufo, gameState}))
  _.set(gameState, "buttonPosition", calcButtonsPositions(gameState.menu.buttons));

  // create copy of first frame characters for final screen
  // Object.keys(gameState.characters).forEach(k => _.set(
  //   gameState,
  //   ['characters_gs', k, PLAYER_STATE.idle],
  //   [_.cloneDeep(gameState.characters[k][PLAYER_STATE.idle][0])]
  // ))

  // menu's and final screen functions
  drawPlayer = drawPlayerInit(this);
  drawMenu = drawMenuInit(this, gameState);
  drawGameplay = drawGameplayInit(this, gameState);
  drawReplay = drawReplayInit(this, gameState, drawPlayer);
}

export const setup = async function () {
  this.pixelDensity(3.0);
  const c = this.createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
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

  c.mouseClicked((ev) => {
    const [x, y] = [this.mouseX, this.mouseY];

    if (gameState.status === GAME_STATE.waitingForPlayers) {
      if (checkPosition(x, y, gameState.buttonPosition.start)) {
        startGameHandler();
      }
      if (checkPosition(x, y, gameState.buttonPosition.add_player) && Object.keys(gameState.players).length < 4) {
        addPlayerHandler(this);
      }
    }

    if (gameState.status === GAME_STATE.waitingForRoll) {
      if (checkPosition(x, y, gameState.buttonPosition.roll)) {
        rollHandler();
      }
    }

    if (gameState.status === GAME_STATE.gameOver) {
      if (checkPosition(x, y, gameState.buttonPosition.replay)) {
        window.location.reload();
      }
    }
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

  if (gameState.status === GAME_STATE.waitingForPlayers) {
    this.fill(TINT_COLOR);
    this.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawMenu(this);
  }
  if (gameState.status === GAME_STATE.waitingForRoll) {
    drawGameplay(this);
  }
  if (gameState.status === GAME_STATE.gameOver) {
    this.fill(TINT_COLOR);
    this.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawReplay(this);
  }
}

const rollHandler = () => {
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
    _.set(gameState, 'winner', player);
  }));
};

const startGameHandler = () => {
  if (Object.keys(gameState.players).length < 2) return;
  _.set(gameState, "status", GAME_STATE.waitingForRoll);
};

const addPlayerHandler = (r) => {
  const queueOrder = Object.keys(gameState.players).length;
  const id = 'test_player' + queueOrder;
  const pl = {
    id,
    username: id,
    queueOrder,
    spot: START_SPOT,
  }
  _.set(gameState.players, pl.id, instPlayer(r, pl, chars, gameState));
};

const setGameState = (update) => {
  _.assignIn(gameState, update);
}
// mess
const applyRoll = (prev, next) => (fn) => {
  if (prev.status === GAME_STATE.waitingForRoll && next.status === GAME_STATE.moving) {
    const roll = next.roll;
    const player = _.find(gameState.players, (pl) => pl.queueOrder === roll.next)
    if (player) return fn(player, roll.roll);
  }
}
