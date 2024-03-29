export const DEBUG = true;

export const ANIMATION_SPEED_SKY = 0.02;
export const FRAMERATE           = 60;
export const FIELD_OFFSET        = 32;
export const FIELD_SIZE          = 320;
export const TILE_SIZE           = 32;

export const SCREEN_HEIGHT   = FIELD_SIZE + TILE_SIZE * 2;
export const SCREEN_WIDTH    = SCREEN_HEIGHT * 1.8;

export const ONSCREEN_OFFSET = Math.round(SCREEN_WIDTH / 4);

export const UFO_TILE_WIDTH  = 96;
export const UFO_TILE_HEIGHT = 64;
export const MAX_SPOT        = 99;
export const START_SPOT      = 0;

export const PATHS = [
  [8, 26],
  [21, 82],
  [43, 77],
  [50, 91],
  [54, 93],
  [62, 96],
  [66, 87],
  [80, 100],
  // snakes
  [98, 28],
  [95, 24],
  [92, 51],
  [83, 19],
  [73, 1],
  [69, 9],
  [64, 36],
  [59, 17],
  [55, 7],
  [52, 11],
  [48, 9],
  [46, 5],
  [44, 22],
]

export const PLAYER_STATE = {
  idle:    'idle',
  walk:    'walk',
  stop:    'stop',
  pre_tp:  'pre_tp',
  post_tp: 'post_tp',
  tp:      'tp'
}

export const UFO_STATE = {
  no_render: 'no_render',
  idle:      'idle',
  finish:    'finish',
}

export const GAME_STATE = {
  waiting:        'waiting_for_players',
  waitingForRoll: 'waiting_for_roll',
  moving:         'moving',
  gameOver:       'game_over',
}

export const TINT_COLOR = 'rgba(0,0,0, 0.75)';
