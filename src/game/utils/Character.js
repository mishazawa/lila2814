import * as p5 from 'p5'

import { Renderable } from './Renderable';
import { TILE_SIZE, PLAYER_STATE } from "../constants";
import { SequenceAnimation } from './Animation';
import { app as Firebase } from '../../database/common';


export class Character extends Renderable {
  constructor (renderer, props) {
    super(renderer, props);

    this.state = PLAYER_STATE.idle;
    this.setSpotPosition()
    this.velocity = renderer.createVector(1, 0)


    this.currentFrame = 0;
    this.frameCount = 0;

    this.rollNumber = 0;
    this.nextSpot = this.position;
  }


  update () {
    this.animateWalk();
    this.animateTeleportation();
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
    if (rollNumber <= 0) return this.stopMoving();
    this.rollNumber = rollNumber;
    if (this.checkLastSpot()) {
      if (!this.gameState.gameOver) {
        this.gameState.gameOver = true;
        this.setState(PLAYER_STATE.tp);
      }
      return
    }
    this.succSpot();
    this.setState(PLAYER_STATE.walk);

    this.nextSpot = this.assingPosition(this.gameState.field.tiles[this.spot].coords())

    this.velocity = this.assingVelocity(
      this.nextSpot,
      this.position,
      this.gameState.characters[this.skin_id].config.fps.walk
    );
  }

  animateWalk = () => {
    if (this.state === PLAYER_STATE.stop) return this.teleportation();
    if (this.state !== PLAYER_STATE.walk) return;
    if (Math.round(this.position.dist(this.nextSpot)) !== 0) return this.position.add(this.velocity);
    this.resetVelocity();
    this.setState(PLAYER_STATE.idle);
    this.move(this.rollNumber - 1);
  }

  teleportation = () => {
    const { tiles, green_mask_anim, red_mask_anim } = this.gameState.field;
    if (tiles[this.spot].snake) return this.teleport(red_mask_anim);
    if (tiles[this.spot].ladder) return this.teleport(green_mask_anim);
    return this.setState(PLAYER_STATE.idle);
  }

  mirrorTile = (direction) => {
    if (direction !== -1)  return;
    this.renderer.scale(direction, 1);
    this.renderer.translate(-TILE_SIZE, 0);
  }

  renderTile = () => {
    if (this.state === PLAYER_STATE.tp ||
        this.state === PLAYER_STATE.pre_tp ||
        this.state === PLAYER_STATE.post_tp) return;

    const skin = this.gameState.characters[this.skin_id];

    let frames = skin[this.state];
    if (!frames) frames = skin[PLAYER_STATE.idle];

    this.renderer.image(frames[this.currentFrame % frames.length], 0, 0)
  }

  frameLimiter = () => {
    const skin = this.gameState.characters[this.skin_id];

    if (!skin[this.state]) return;

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
  }

  checkLastSpot = () => this.spot === this.gameState.field.tiles.length - 1

  teleport (animationMask) {
    this.setState(PLAYER_STATE.pre_tp);

    const animateFn = this.createAnimationSequence(animationMask);
    this.teleportAnimation = new SequenceAnimation(animationMask, animateFn, this.postTeleport);
  }


  animateTeleportation = () => {
    if (this.teleportAnimation) {
      const isFinished = this.teleportAnimation.render();
      if (isFinished) return this.teleportAnimation.next()
    }
  }

  postTeleport = (animationMask, animateFn) => {
    this.teleportAnimation = null;
    this.spot = this.gameState.field.tiles[this.spot].next;
    this.setSpotPosition();
    this.setState(PLAYER_STATE.post_tp);

    this.teleportAnimation = new SequenceAnimation(animationMask, animateFn, this.stopAnimation);
  }

  stopAnimation = () => {
    this.teleportAnimation = null;
    this.setState(PLAYER_STATE.idle);
  }

  createAnimationSequence = (animationMask) => (current) => {
    const coords = this.gameState.field.tiles[this.spot].coords();
    this.renderer.push();
    this.renderer.translate(coords.x, coords.y);
    this.renderer.image(animationMask[current], 0, 0);
    this.renderer.pop();
  }

  setSpotPosition = () => {
    this.position = this.assingPosition(this.gameState.field.tiles[this.spot].coords())
  }

  stopMoving = () => {
    this.setState(PLAYER_STATE.stop);
    return Firebase.callFn('updateGame', {
      gameId: this.renderer.data.id,
      playerId: this.id,
      spot: this.spot,
    }).catch((err) => {})
  }

  assingPosition = ({x, y, direction}) => this.renderer.createVector(x, y, direction);

  assingVelocity = (a, b, multiplier) => p5.Vector.sub(a, b).normalize().mult(multiplier * 0.2);

  resetVelocity = () => this.velocity = this.renderer.createVector();

}
