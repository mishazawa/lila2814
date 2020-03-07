class Renderable {
  layer = null;

  constructor (renderer, props = {}) {
    this.renderer = renderer;
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
  }
  render () {
    throw new Error("#render should be implemented!");
  }
}

export class Animation extends Renderable {
  update () {}
  render () {}

  play (...args) {

    this.update(...args);
    this.render(...args);
  }
}
