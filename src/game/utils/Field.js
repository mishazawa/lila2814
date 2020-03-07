import _ from 'lodash';

import { Tile } from './Tile';
import { Renderable } from './Renderable';
import { Animation } from './Animation';
import { FIELD_SIZE, TILE_SIZE, IGNORED_TILES, PATHS } from './../constants';

export class Field extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.tiles = [];
    this.rows = this.cols = FIELD_SIZE / TILE_SIZE;
    this.currentBlink = 0;
  }

  tiles (index = null) {
    return !index ? this.tiles : this.tiles[index];
  }

  create (gameState) {
    let direction = 1;
    let x = 0;
    let y = (this.rows - 1) * TILE_SIZE;

    this.tiles = _.times(this.rows * this.cols, (i) => {
      const tile = new Tile(this.renderer, {
        direction,
        x,
        y,
        index: i,
        next: i + 1,
        skin: null,
      });

      x += (TILE_SIZE * direction);

      if (x >= FIELD_SIZE || x <= -TILE_SIZE) {
        direction *= -1;
        x += TILE_SIZE * direction;
        y -= TILE_SIZE;
      }

      return tile;
    })

    PATHS.forEach(([spot, destination]) => {
      this.tiles[spot - 1].next = destination - 1;

      if (spot > destination) {
        this.tiles[spot-1].snake = true;
        this.tiles[spot-1].skin = this.createPortal(this.portal_red, spot);
        this.tiles[spot-1].blink = this.createSpot(this.red_light, spot);
        this.tiles[destination-1].blink = this.createSpot(this.red_light, destination, this.idle);
      }
      if (spot < destination) {
        this.tiles[spot-1].ladder = true;
        this.tiles[spot-1].skin = this.createPortal(this.portal_green, spot);
        this.tiles[spot-1].blink = this.createSpot(this.green_light, spot);
        this.tiles[destination-1].blink = this.createSpot(this.green_light, destination, this.idle);
      }
    });

    return this;
  }

  render () {
    this.renderer.push();
    this.tiles.forEach(t => t.render());
    this.renderPath();
    this.renderer.pop();
    if (this.renderer.frameCount % 50 === 0) {
      this.currentBlink++;
    }
    if (this.currentBlink === PATHS.length) this.currentBlink = 0;
  }

  renderPath () {
    PATHS.forEach(([spot, destination], i) => {
      // const start = this.tiles[spot-1].center();
      // const end = this.tiles[destination-1].center();
      // this.renderer.line(start.x, start.y, end.x, end.y)
      if (this.tiles[spot-1].skin) {
        this.tiles[spot-1].skin.play();
        this.tiles[spot-1].blink.play(this.currentBlink === i);
        this.tiles[destination-1].blink.play(this.currentBlink === i);
      }
    });
  }

  createPortal (skin, spot) {
    return new Animation(this.renderer, {
      frames: skin,
      speed: 4,
      currentFrame: Math.floor(this.renderer.random(0, skin.length)),
      coords: this.tiles[spot-1].coords(),
      update () {
        if (this.currentFrame === this.frames.length - 1) {
          this.currentFrame = 0;
        }
        if (this.renderer.frameCount % this.speed === 0) {
          this.currentFrame += 1;
        }
      },
      render() {
        this.renderer.push();
        this.renderer.translate(this.coords.x, this.coords.y)
        this.renderer.image(this.frames[this.currentFrame], 0, 0);
        this.renderer.pop();
      }
    });
  }

  createSpot (skin, destination, idle) {
    return new Animation(this.renderer, {
      skin,
      idle,
      show: 1,
      coords: this.tiles[destination-1].coords(),
      update () {
      },
      render (blink = false) {
        this.renderer.push();
        this.renderer.translate(this.coords.x, this.coords.y)
        this.idle && this.renderer.image(this.idle, 0, 0);
        if (!blink) this.renderer.image(this.skin, 0, 0);
        this.renderer.pop();
      }
    })
  }
}

