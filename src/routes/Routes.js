import React, { Suspense } from "react";
import { Router, Route, Redirect } from "react-router-dom";
import { PrivateRoute, lazyWithPreload } from "../utils";
import history from "../history";
import { projectModules } from "../constants";
import Home from "../pages/home/Home";

const ProjectPages = lazyWithPreload(() => import("./ProjectPages"));
const OnboardingPages = lazyWithPreload(() => import("./OnboardingPages"));
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
        <OnboardingPages />
        <ProjectPages />
        <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SECURITY_RULES}`} component={RulesEditor} />
      </Suspense>
    </Router>
  );
};

export default Routes