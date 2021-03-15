import React from "react";
import { Route } from "react-router-dom";
import { PrivateRoute } from "../utils";

import Authentication from "../pages/authentication/authentication/Authentication";
import Verify from '../pages/authentication/verify/Verify';
import Login from "../pages/login/Login";
import Welcome from "../pages/welcome/Welcome";
import CreateProject from "../pages/create-project/CreateProject";

function OnboardingPages() {
  return (
    <React.Fragment>
      <Route exact path="/mission-control/signup" component={() => <Authentication mode='signup' />} />
      <Route exact path="/mission-control/signin" component={() => <Authentication mode='signin' />} />
      <Route exact path="/mission-control/verify" component={Verify} />
      <PrivateRoute exact path="/mission-control/welcome" component={Welcome} />
      <PrivateRoute exact path="/mission-control/create-project" component={CreateProject} />
    </React.Fragment>
  )
}

export default OnboardingPages