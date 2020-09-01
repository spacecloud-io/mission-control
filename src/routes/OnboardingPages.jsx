import React from "react";
import { Route } from "react-router-dom";
import { PrivateRoute } from "../utils";

import Login from "../pages/login/Login";
import Welcome from "../pages/welcome/Welcome";
import CreateProject from "../pages/create-project/CreateProject";

function OnboardingPages() {
  return (
    <React.Fragment>
      <Route exact path="/mission-control/login" component={Login} />
      <PrivateRoute exact path="/mission-control/welcome" component={Welcome} />
      <PrivateRoute exact path="/mission-control/create-project" component={CreateProject} />
    </React.Fragment>
  )
}

export default OnboardingPages