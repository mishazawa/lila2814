import { Renderable } from './Renderable';
import { TILE_SIZE, PLAYER_STATE } from "../constants";

export class Character extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.spot = 10;
    this.rest = 0;

    this.state = PLAYER_STATE.idle;

    this.offset = 0;
    this.currentFrame = 0;
    this.frameCount = 0;
  }


  render () {
    const { field, characters } = this.gameState;

    const { x, y, direction } = field.tiles[this.spot].coords();
    const skin = characters[this.username];

    this.renderer.push();

    this.renderer.translate(x, y);
    this.mirrorTile(direction);
    this.renderer.image(skin[this.state][this.currentFrame], 0, 0)

    this.renderer.pop();


    this.frameLoop(skin, this.state);
  }


  frameLoop = (skin, state) => {
    if (this.currentFrame === skin[state].length - 1) {
      this.currentFrame = 0;
    } else {
      if (this.renderer.frameCount % skin.config.fps[state] === 0) {
        this.currentFrame++;
      }
    }
  }

  mirrorTile = (direction) => {
    if (direction !== -1)  return;
    this.renderer.scale(direction, 1);
    this.renderer.translate(-TILE_SIZE, 0);
  }
}
