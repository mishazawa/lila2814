import { Renderable } from './Renderable';
import { TILE_SIZE, FIELD_OFFSET } from './../constants';

export class Tile extends Renderable {

  render () {
    this.renderer.push();
    // this.renderer.noStroke();
    // this.renderer.fill(this.index % 2 ? this.renderer.color(200, 200, 200, 100) : this.renderer.color(100, 100, 100, 100));
    // this.renderer.rect(this.x, this.y, TILE_SIZE, TILE_SIZE);
    this.renderer.fill(255);
    // this.renderer.text(this.index + 1, this.x + 10, this.y + 20);
    // this.portal && this.portal.render();
    this.renderer.pop();
  }

  coords () {
    return {
      x: this.x,
      y: this.y,
      direction: this.direction
    }
  }

  center () {
    const offset = TILE_SIZE / 2
    return {
      x: this.x + offset,
      y: this.y + offset
    }
  }
}
