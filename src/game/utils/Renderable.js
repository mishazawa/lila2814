export class Renderable {
  constructor (renderer, props = {}) {
    this.renderer = renderer;
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
  }
  render () {
    console.warn("#render should be implemented!");
  }
}
