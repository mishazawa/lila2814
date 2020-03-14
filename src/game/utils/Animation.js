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
  constructor(val, renderFn = () => {}, nextFn = () => {}, counter = (curr) => curr + 1) {
    this.length = val.length;
    this.current = 0;

    this.next = () => nextFn(val, renderFn);
    this.counterFn = counter
    this.renderFn = renderFn;
  }

  render () {
    this.renderFn(this.current);
    this.current = this.counterFn(this.current);
    return this.current === this.length;
  }
}
