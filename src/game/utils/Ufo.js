import { Renderable } from './Renderable';
import { SequenceAnimation } from './Animation';
import { TILE_SIZE, UFO_STATE } from '../constants';

export class Ufo extends Renderable {
  constructor (...props) {
    super(...props);
    this.state = UFO_STATE.idle;
    this.offset = this.renderer.random(-5, 5);
    this.currentFrame = 0;
    this.frameCount = 0;

    this.finishAnimation = new SequenceAnimation(this.skin, (current) => {
      this.renderer.translate(-TILE_SIZE, -TILE_SIZE);
      this.renderer.image(this.skin[current], 0, 0);
    }, () => {
      this.state = UFO_STATE.no_render;
    })
  }

  update = () => {
    if (this.gameState.gameOver) {
      this.state = UFO_STATE.finish;
    }
  }

  render () {
    if (this.state === UFO_STATE.no_render) return;
    this.update();

    this.renderer.push();

    if (this.state === UFO_STATE.idle) this.idleRender();
    if (this.state === UFO_STATE.finish) this.finishRender();

    this.renderer.pop();
  }

  idleRender = () => {
    if (this.renderer.frameCount % this.config.fps.idle === 0) {
      this.offset = this.renderer.noise(this.renderer.frameCount);
    }
    this.renderer.translate(-TILE_SIZE + this.offset, -TILE_SIZE + this.offset);
    this.renderer.image(this.skin[this.currentFrame], 0, 0);
  }

  finishRender = () => {
    const isFinished = this.finishAnimation.render();
    if (isFinished) {
      this.finishAnimation.next();
    }
  }

}
