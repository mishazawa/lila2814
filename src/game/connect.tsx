import React from 'react';
import { withRouter, RouteComponentProps } from "react-router";

import { app } from '../database/mock';

class Connect extends React.Component<RouteComponentProps> {

  componentDidMount () {
    app.callFn('createGame', {}).then(({data}) => {
      this.props.history.replace(`/game/${data.id}`);
    })
  }

  render() {
    return null;
  }
}

export default withRouter(Connect)
