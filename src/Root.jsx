/* eslint-disable global-require */
import { Component } from "react";
import { BrowserRouter } from "react-router-dom";


import App from "./App";


export default class Root extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
          <BrowserRouter >
            <App />
          </BrowserRouter>
    );
  }
}
