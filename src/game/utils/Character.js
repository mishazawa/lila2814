import { Renderable } from './Renderable';
import { TILE_SIZE, PLAYER_STATE } from "../constants";

export class Character extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.spot = 0;
    this.rest = 0;

    this.state = PLAYER_STATE.idle;

    this.offset = 0;
    this.currentFrame = 0;
    this.frameCount = 0;
  }

  update () {
    this.frameLimiter();
  }

  render () {
    const { field } = this.gameState;

    const { x, y, direction } = field.tiles[this.spot].coords();

    this.renderer.push();
    this.renderer.translate(x, y);
    this.mirrorTile(direction);
    this.renderTile();
    this.renderer.pop();

    this.update();
  }

  move = async (rollNumber) => {
    while (rollNumber !== 0) {
      this.rest -= 1;
      this.spot += 1;
      this.state = PLAYER_STATE.walk;
      await this.playWalkAnimation();
      rollNumber -= 1;
    }
    this.state = PLAYER_STATE.idle;
  }

  playWalkAnimation = () => new Promise((res) => {
    setTimeout(res, 1000);
  })

  mirrorTile = (direction) => {
    if (direction !== -1)  return;
    this.renderer.scale(direction, 1);
    this.renderer.translate(-TILE_SIZE, 0);
  }

  renderTile = () => {
    const skin = this.gameState.characters[this.username];
    this.renderer.image(skin[this.state][this.currentFrame % skin[this.state].length], 0, 0)
  }

  frameLimiter = () => {
    const skin = this.gameState.characters[this.username];

    if (this.renderer.frameCount % skin.config.fps[this.state] === 0) {
      this.currentFrame++;
    }

    if (this.currentFrame === skin[this.state].length) {
      this.currentFrame = 0;
    }
  }
}
