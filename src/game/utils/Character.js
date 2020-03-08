import { Renderable } from './Renderable';
import { TILE_SIZE, PLAYER_STATE } from "../constant";

export class Character extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.spot = 0;
    this.rest = 0;

    this.state = PLAYER_STATE.idle;

    this.offset = 0;
    this.currentFrame = 0;
    this.frameCount = 0;
    this,configure(props.config);
  }

  configure ({fps}) {
    this.fps = fps;
  }
}
