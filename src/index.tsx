import 'core-js/es';
import 'core-js/es/set';
import 'core-js/es/map';
import 'core-js/es/array';
import 'raf/polyfill';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Sketch } from './game';

import { init as initFirebase } from './database/common';

initFirebase();

ReactDOM.render(<Sketch />, document.getElementById('root'));
