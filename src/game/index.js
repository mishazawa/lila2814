import React from 'react';
import { withRouter } from "react-router";

import { create, setup, draw, preload } from './sketch'

import { init as initFirebase } from '../database/common';


class SketchWrapper extends React.Component {
  ref = React.createRef();

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount () {
    initFirebase()
      .then(async (app) => {
        const { data } = await app.callFn(
          this.props.match.params.id ? 'getGame' : 'createGame',
          this.props.match.params
        )
        return { app, data }
      })
      .then(({data, app}) => {
        create({
          setup, draw, preload,
          wrapper: this.ref.current,
          firebase: app,
          history: this.props.history,
          data,
        })
      })
      .catch((err) => {
        console.log(err)
        // this.props.history.push('/')
      });
  }
  render () {
    return <div ref={this.ref}></div>
  }
}
export const Sketch = withRouter(SketchWrapper);
