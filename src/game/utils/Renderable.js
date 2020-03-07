export class Renderable {
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
