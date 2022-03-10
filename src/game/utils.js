import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  GAME_STATE,
  PLAYER_STATE,
  MAX_SPOT,
} from './constants';

import { Character } from './utils/Character';

export const calcButtonsPositions = (b) => ({
  start: {
    a: SCREEN_WIDTH/2  - b.start.width/2,
    b: SCREEN_HEIGHT/2 - b.start.height/2 - 10,
    c: SCREEN_WIDTH/2  - b.start.width/2  + b.start.width,
    d: SCREEN_HEIGHT/2 - b.start.height/2 - 10 + b.start.height,
  },
  add_player: {
    a: SCREEN_WIDTH/2  - b.add_player.width/2,
    b: SCREEN_HEIGHT/2 - b.add_player.height/2 + b.add_player.height,
    c: SCREEN_WIDTH/2  - b.add_player.width/2  + b.add_player.width,
    d: SCREEN_HEIGHT/2 - b.add_player.height/2 + b.add_player.height + b.add_player.height,
  },
  roll: {
    a: SCREEN_WIDTH  - b.roll.width  - 25,
    b: SCREEN_HEIGHT - b.roll.height - 25,
    c: SCREEN_WIDTH  - 25,
    d: SCREEN_HEIGHT - 25,
  },
  replay: {
    a: SCREEN_WIDTH /2 - b.replay.width /2,
    b: SCREEN_HEIGHT - SCREEN_HEIGHT/3 - b.replay.height,
    c: SCREEN_WIDTH /2 - b.replay.width /2 + b.replay.width,
    d: SCREEN_HEIGHT - SCREEN_HEIGHT/3 - b.replay.height + b.replay.height,
  }
})

export const checkPosition = (x, y, target) => {
  return (x >= target.a && x < target.c && y >= target.b && y < target.d)
}

export const randomRoll = () => Math.floor(Math.random() * 6) + 1;
export const getStatus = (spot) => spot > MAX_SPOT ? GAME_STATE.gameOver : GAME_STATE.waitingForRoll;

export const drawPlayerInit = (r) => {
  // do not animate all characters
  // only animate winner
  let currentFrame = 0;
  return (skin, gs = false, animate = true) => {
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
}

export const drawMenuInit = (r, gameState) => () => {
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

export const drawGameplayInit = (r, gameState) => () => {
  const bp = gameState.buttonPosition;
  r.push()
  r.translate(bp.roll.a, bp.roll.b);
  r.image(gameState.menu.buttons.roll, 0, 0);
  r.pop()
}

export const drawReplayInit = (r, gameState, drawPlayer) => () => {
  const bp = gameState.buttonPosition;
  r.push()
  r.translate(bp.replay.a, bp.replay.b);
  r.image(gameState.menu.buttons.replay, 0, 0);
  r.pop()

  const winner = gameState.winner.skin_id;

  Object.keys(gameState.players).forEach((k) => {
    const {skin_id} = gameState.players[k];
    if (skin_id === winner) return;
    drawPlayer(gameState.characters_gs[skin_id], true, false);
  });

  drawPlayer(gameState.characters[winner]);
}

export const drawCurrentRollInit = (r, gameState) => () => {
  const bp = gameState.buttonPosition;
  const b = gameState.menu.buttons;

  r.push()
  r.textSize(24);
  r.textAlign(r.CENTER, r.CENTER);
  r.fill("#2CD692");
  r.text(gameState.roll, bp.roll.a, bp.roll.b, b.roll.width, b.roll.height);
  r.pop()
}

export const drawCurrentPlayerInit = (r, gameState) => () => {
  if (!gameState.currentPlayer) return;

  const skin = gameState.characters[gameState.currentPlayer.skin_id];
  const frames = skin[PLAYER_STATE.idle];
  let frame = frames[0];

  const bp = gameState.buttonPosition;
  r.push()
  r.translate(bp.roll.a - 65, bp.roll.b - 24);
  r.scale(2)
  r.image(frame, 0, 0);
  r.pop()
}

export const instPlayer = (renderer, data, chars, gameState) => new Character(renderer, {
  gameState,
  id: data.id,
  spot: data.spot || 0,
  username: data.username,
  queueOrder: data.queueOrder,
  skin_id: chars[data.queueOrder],
  config: gameState.characters[chars[data.queueOrder]],
})
