import React from 'react';
import { withRouter } from "react-router";

import { create, setup, draw, preload } from './sketch'

import { app } from '../database/mock';


class SketchWrapper extends React.Component {
  ref = React.createRef();

  componentDidMount () {
    app.callFn('getGame', this.props.match.params).then(({data}) => {
      create({
        setup, draw, preload,
        wrapper: this.ref.current,
        history: this.props.history,
        data,
      })
    }).catch((err) => {
      console.log(err)
    });
  }
  render () {
    return <div ref={this.ref} className="sketch"></div>
  }
}
export const Sketch = withRouter(SketchWrapper);
