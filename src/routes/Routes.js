import React, { Suspense } from "react";
import { Router, Route, Redirect } from "react-router-dom";
import { PrivateRoute, lazyWithPreload } from "../utils";
import history from "../history";
import { projectModules } from "../constants";
import Home from "../pages/home/Home";

const Login = lazyWithPreload(() => import("../pages/login/Login"));
const Welcome = lazyWithPreload(() => import("../pages/welcome/Welcome"));
const CreateProject = lazyWithPreload(() => import("../pages/create-project/CreateProject"));
const ProjectPages = lazyWithPreload(() => import("./ProjectPages"));
const RulesEditor = lazyWithPreload(() => import("../pages/security-rules/RulesEditor"));

function SuspenseFallBack() {
  return (
    <Home loadingPage />
  )
}

function Routes() {

  return (
    <Router history={history}>
      <Suspense fallback={<SuspenseFallBack />}>
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