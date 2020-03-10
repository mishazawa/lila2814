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


export class SequenceAnimation {
  constructor(val, renderFn = () => {}, nextFn = () => {}) {
    this.length = val.length;
    this.current = 0;

    this.next = () => nextFn(val, renderFn);
    this.renderFn = renderFn;
  }

  render () {
    this.renderFn(this.current);
    this.current += 1;
    return this.current === this.length;
  }
}
