import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from "./store";
import { performSetup, markSetupComplete } from './utils';
import App from './App';
import { makeServer } from "./mirage/server";
import * as serviceWorker from './serviceWorker';
import './index.css'

const jsonlint = require("jsonlint-mod");
window.jsonlint = jsonlint;

if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_ENABLE_MOCK) {
  makeServer();
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// Perform setup on app (re)load
// It performs all the actions required to be done before user can start interacting with mission control.
// This includes loading space cloud environment, refreshing token and fetching all resources that needs to be fetched.
// A special loading page is shown untill this setup gets complete. 
performSetup().then(() => markSetupComplete())