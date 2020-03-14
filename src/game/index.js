import React from 'react';
import { withRouter } from "react-router";

import { create, setup, draw, preload } from './sketch'

import { app } from '../database/common';


class SketchWrapper extends React.Component {
  ref = React.createRef();

  state = { ready : false }

  componentDidMount () {
    app.callFn('getGame', this.props.match.params).then(({data}) => {
      create({
        setup, draw, preload,
        wrapper: this.ref.current,
        history: this.props.history,
        data,
      })
      this.setState({ready: true})
    }).catch((err) => {
      console.log(err)
    });
  }
  render () {
    if (!this.state.ready) return null;
    return <div ref={this.ref}></div>
  }
}
export const Sketch = withRouter(SketchWrapper);
