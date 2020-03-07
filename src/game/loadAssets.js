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
