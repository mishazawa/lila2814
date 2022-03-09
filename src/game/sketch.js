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
  PLAYER_STATE,
} from './constants';

import { Animation } from './utils/Animation';
import { Field }     from './utils/Field';
import { Character } from './utils/Character';
import { Ufo }       from './utils/Ufo';

import {
  addBackgrounds,
  addButtons,
  createAnimationsForBackgroundLayers,
  addEnvironmentObjects,
  addCharacters,
  addUfo,
} from './loadAssets';

const MAX_SPOT    = 99;

const randomRoll = () => Math.floor(Math.random() * 6) + 1;
const getStatus = (spot) => spot > MAX_SPOT ? GAME_STATE.gameOver : GAME_STATE.waitingForRoll;
const gameOver = (player) => {
  gameState.winner = player;
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
  menu: {
    buttons: {},
    buttons_gs: {},
  },
  players: {},
  animation: {
    background: [1, 3, 6],
  },
  characters: {},
  ufo: null,
  field: null,
  gameOver: false,
  connectionHandler: () => {},
  buttonPosition: null,
};

const checkPosition = (x, y, target) => {
  return (x >= target.a && x < target.c && y >= target.b && y < target.d)
}

const drawMenu = function (r) {
  const bp = gameState.buttonPosition;
  r.push()
  r.translate(bp.start.a, bp.start.b);

  if (Object.keys(gameState.players).length < 2) {
    gameState.menu.buttons_gs.start.filter(r.GRAY);
    r.image(gameState.menu.buttons_gs.start, 0, 0);
  } else {
    r.image(gameState.menu.buttons.start, 0, 0);
  }
  r.pop()

  // ----------------------

  r.push()
  r.translate(bp.add_player.a, bp.add_player.b);

  if (Object.keys(gameState.players).length === 4) {
    gameState.menu.buttons_gs.add_player.filter(r.GRAY);
    r.image(gameState.menu.buttons_gs.add_player, 0, 0);
  } else {
    r.image(gameState.menu.buttons.add_player, 0, 0);
  }

  r.pop()

}
const drawGameplay = function (r) {
  const bp = gameState.buttonPosition;
  r.push()
  r.translate(bp.roll.a, bp.roll.b);
  r.image(gameState.menu.buttons.roll, 0, 0);
  r.pop()
}

let currentFrame = 0;

const drawPlayer = (r, skin, gs = false, animate = true) => {
  const frames = skin[PLAYER_STATE.idle];
  let frame = frames[0];
  if (animate) {
    if (r.frameCount % skin.config.fps[PLAYER_STATE.idle] === 0) {
      currentFrame++;
    }

    if (currentFrame === skin[PLAYER_STATE.idle].length) {
      currentFrame = 0;
    }

    frame = frames[currentFrame % frames.length];
  }

  if (gs) frame.filter(r.GRAY);

  r.push()
  r.translate(
    SCREEN_WIDTH /2 - frame.width * 2,
    SCREEN_HEIGHT/3 - frame.height);
  r.scale(4)
  r.image(frame, 0, 0)
  r.pop()
}

const drawReplay = function (r) {
  const bp = gameState.buttonPosition;
  r.push()
  r.translate(bp.replay.a, bp.replay.b);
  r.image(gameState.menu.buttons.replay, 0, 0);
  r.pop()

  const winner = gameState.winner.skin_id;

  Object.keys(gameState.players).forEach((k) => {
    const {skin_id} = gameState.players[k];
    if (skin_id === winner) return;
    drawPlayer(r, gameState.characters[skin_id], true, false);
  });

  drawPlayer(r, gameState.characters[winner]);
}

export const preload = async function () {
  addBackgrounds(gameState.layers, this.loadImage);
  addButtons(gameState.menu.buttons, this.loadImage);
  addButtons(gameState.menu.buttons_gs, this.loadImage);

  const [characters, field, ufo] = await Promise.all([
    addCharacters({}, this.loadImage),
    addEnvironmentObjects({}, this.loadImage),
    addUfo({}, this.loadImage),
  ]);

  _.set(gameState, 'characters', characters.pop());
  _.set(gameState, 'field', new Field(this, field.pop()));
  _.set(gameState, 'ufo', new Ufo(this, {...ufo, gameState}))

  _.set(gameState, "buttonPosition", {
    start: {
      a: SCREEN_WIDTH/2  - gameState.menu.buttons.start.width/2,
      b: SCREEN_HEIGHT/2 - gameState.menu.buttons.start.height/2 - 10,
      c: SCREEN_WIDTH/2  - gameState.menu.buttons.start.width/2  + gameState.menu.buttons.start.width,
      d: SCREEN_HEIGHT/2 - gameState.menu.buttons.start.height/2 - 10 + gameState.menu.buttons.start.height,
    },
    add_player: {
      a: SCREEN_WIDTH/2  - gameState.menu.buttons.add_player.width/2,
      b: SCREEN_HEIGHT/2 - gameState.menu.buttons.add_player.height/2 + gameState.menu.buttons.add_player.height,
      c: SCREEN_WIDTH/2  - gameState.menu.buttons.add_player.width/2  + gameState.menu.buttons.add_player.width,
      d: SCREEN_HEIGHT/2 - gameState.menu.buttons.add_player.height/2 + gameState.menu.buttons.add_player.height + gameState.menu.buttons.add_player.height,
    },
    roll: {
      a: SCREEN_WIDTH  - gameState.menu.buttons.roll.width  - 25,
      b: SCREEN_HEIGHT - gameState.menu.buttons.roll.height - 25,
      c: SCREEN_WIDTH  - 25,
      d: SCREEN_HEIGHT - 25,
    },
    replay: {
      a: SCREEN_WIDTH /2 - gameState.menu.buttons.replay.width /2,
      b: SCREEN_HEIGHT - SCREEN_HEIGHT/3 - gameState.menu.buttons.replay.height,
      c: SCREEN_WIDTH /2 - gameState.menu.buttons.replay.width /2 + gameState.menu.buttons.replay.width,
      d: SCREEN_HEIGHT - SCREEN_HEIGHT/3 - gameState.menu.buttons.replay.height + gameState.menu.buttons.replay.height,
    }
  });
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
    gameOver(player);
  }));
};

const startGameHandler = () => {
  if (Object.keys(gameState.players).length < 2) return;
  _.set(gameState, "status", GAME_STATE.waitingForRoll);
};

const chars = _.shuffle(['pink', 'blue', 'red', 'yellow'])

const addPlayerHandler = (r) => {
  const queueOrder = Object.keys(gameState.players).length;
  const id = 'test_player' + queueOrder;
  const pl = {
    id,
    username: id,
    queueOrder,
    spot: 0,
  }
  _.set(gameState.players, pl.id, instPlayer(r, pl, chars));
};

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
    this.fill('rgba(0,0,0, 0.75)');
    this.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawMenu(this);
  }
  if (gameState.status === GAME_STATE.waitingForRoll) {
    drawGameplay(this);
  }
  if (gameState.status === GAME_STATE.gameOver) {
    this.fill('rgba(0,0,0, 0.75)');
    this.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    drawReplay(this);
  }
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
  config: gameState.characters[chars[data.queueOrder]],
})

const applyRoll = (prev, next) => (fn) => {
  if (prev.status === GAME_STATE.waitingForRoll && next.status === GAME_STATE.moving) {
    const roll = next.roll;
    const player = _.find(gameState.players, (pl) => pl.queueOrder === roll.next)
    if (player) return fn(player, roll.roll);
  }
}

