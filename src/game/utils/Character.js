import * as p5 from 'p5'

import { Renderable } from './Renderable';
import { TILE_SIZE, PLAYER_STATE } from "../constants";


export class Character extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);
    this.spot = 0;
    this.rest = 0;


    this.state = PLAYER_STATE.idle;
    this.position = this.assingPosition(props.gameState.field.tiles[this.spot].coords())
    this.velocity = renderer.createVector(1, 0)


    this.offset = 0;
    this.currentFrame = 0;
    this.frameCount = 0;

    this.rollNumber = 0;
    this.nextSpot = this.position;
  }


  update () {
    this.animateWalk(this.state);
    this.frameLimiter();
  }

  render () {
    const { direction } = this.gameState.field.tiles[this.spot].coords()

    this.renderer.push();
    this.renderer.translate(this.position);
    this.mirrorTile(direction);
    this.renderTile();
    this.renderer.pop();

    this.update();
  }

  move = (rollNumber) => {
    if (rollNumber <= 0) return;
    this.rollNumber = rollNumber;

    this.succSpot();
    this.setState(PLAYER_STATE.walk);

    this.nextSpot = this.assingPosition(this.gameState.field.tiles[this.spot].coords())

    this.velocity = this.assingVelocity(
      this.nextSpot,
      this.position,
      this.gameState.characters[this.username].config.fps.walk
    );
  }

  animateWalk = () => {
    if (this.state !== PLAYER_STATE.walk) return;
    if (Math.round(this.position.dist(this.nextSpot)) !== 0) return this.position.add(this.velocity);
    this.resetVelocity();
    this.setState(PLAYER_STATE.idle);
    this.move(this.rollNumber - 1);
  }

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

  setState = (state) => this.state = state

  succSpot = () => {
    this.spot += 1;
    this.rest -= 1;
  }

  assingPosition = ({x, y, direction}) => this.renderer.createVector(x, y, direction);

  assingVelocity = (a, b, multiplier) => p5.Vector.sub(a, b).normalize().mult(multiplier * 0.2);

  resetVelocity = () => this.velocity = this.renderer.createVector();

}
