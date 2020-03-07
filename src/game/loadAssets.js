// animated
import bg01a  from '../assets/backgrounds/bg-02.png';
import bg02a  from '../assets/backgrounds/bg-04.png';
import bg03a  from '../assets/backgrounds/bg-06.png';

// static
import bg01   from '../assets/backgrounds/bg-01.png';
import bg02   from '../assets/backgrounds/bg-03.png';
import bg03   from '../assets/backgrounds/bg-05.png';
import bg04   from '../assets/backgrounds/bg-07.png';
import bg05   from '../assets/backgrounds/bg-08.png';

// stairs
import stairs from '../assets/ambient/static/stairs.png';

export const addBackgrounds = (destination, loadFn) => {
  [bg01, bg01a, bg02, bg02a, bg03, bg03a, bg04, bg05, stairs].forEach((asset) => destination.push(loadFn(asset)))
}

const INFINITE_LAYERS = [1, 3, 5]
const STATIC_COPIED_LAYERS = [0, 4, 6, 7]

export const createAnimationsForBackgroundLayers = (gameState, animationSpeedSky) => {
  // infinite layers
  INFINITE_LAYERS.forEach((layerIndex, i) => {
    gameState.layers[layerIndex].update = function () {
      this.position.x += gameState.animation.background[i] * animationSpeedSky;
    }
    gameState.layers[layerIndex].render = function () {
      if (this.position.x >= this.layer.width) this.position.x = 0;
      if (this.position.x > 0) this.renderer.image(this.layer, this.position.x - this.layer.width, 0);
      this.renderer.image(this.layer, this.position.x, 0);
    }
  })

  // copied static layers
  STATIC_COPIED_LAYERS.forEach((layerIndex) => {
    gameState.layers[layerIndex].render = function () {
      this.renderer.image(this.layer, 0, 0);
      this.renderer.image(this.layer, this.layer.width, 0);
    }
  })
}
