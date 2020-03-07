import {Renderable} from './Renderable';

export class Animation extends Renderable {
  update () {}
  render () {
    this.renderer.image(this.layer, this.position.x, 0);
  }

  play (...args) {

    this.update(...args);
    this.render(...args);
  }
}
