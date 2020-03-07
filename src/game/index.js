import React from 'react';

import { create, setup, draw, preload } from './sketch'


export class Sketch extends React.Component {
  ref = React.createRef();

  componentDidMount () {
    create({
      setup, draw, preload,
      wrapper: this.ref.current
    })
  }
  render () {
    return <div ref={this.ref}></div>
  }
}
