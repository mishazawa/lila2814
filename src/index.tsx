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
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";

const App = () => (
  <Router>
    <Route exact component={Sketch} path="/game/:id"/>
    <Route exact component={Sketch} path="/"/>
  </Router>
);


ReactDOM.render(<App />, document.getElementById('root'));
