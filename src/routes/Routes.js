import React, { Suspense } from "react";
import { Router, Route, Redirect } from "react-router-dom";
import { PrivateRoute, lazyWithPreload } from "../utils";
import history from "../history";
import { projectModules } from "../constants";
import Home from "../pages/home/Home";

import Login from "../pages/login/Login";
import Welcome from "../pages/welcome/Welcome";
import CreateProject from "../pages/create-project/CreateProject";
// import ProjectPages from "./ProjectPages";
const ProjectPages = lazyWithPreload(() => import("./ProjectPages"));
const RulesEditor = lazyWithPreload(() => import("../pages/security-rules/RulesEditor"));

function Routes() {

  return (
    <Router history={history}>
      <Suspense fallback={<div>Loading...</div>}>
        <Route exact path="/"
          component={() => <Redirect to={"/mission-control"} />} />
        <Route exact path="/mission-control" component={Home} />
        <Route exact path="/mission-control/login" component={Login} />
        <PrivateRoute exact path="/mission-control/welcome" component={Welcome} />
        <PrivateRoute exact path="/mission-control/create-project" component={CreateProject} />
        <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SECURITY_RULES}`} component={RulesEditor} />
        <ProjectPages />
      </Suspense>
    </Router>
  );
};

export default Routes