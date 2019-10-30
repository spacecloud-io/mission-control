import React from "react";
import { Router, Route, Redirect } from "react-router-dom";
import history from "./history";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Database from "./pages/database/Database";
import UserManagement from "./pages/user-management/UserManagement";
import FunctionRules from "./pages/functions/rules/Rules";
import FileStorageRules from "./pages/file-storage/rules/Rules";
import Configure from "./pages/configure/configure";
import Overview from "./pages/overview/Overview";
import Welcome from "./pages/welcome/Welcome";
import CreateProject from "./pages/create-project/CreateProject";
import Explorer from "./pages/explorer/Explorer";

import DBRules from "./pages/database/rules/DBRules";
import DBSchema from "./pages/database/schema/DBSchema";
import DBOverview from "./pages/database/overview/DBOverview";
import EventTriggers from "./pages/event-triggers/EventTriggers";

export default () => {
  return (
    <Router history={history}>
      <Route exact path="/mission-control" component={Home} />
      <Route exact path="/mission-control/login" component={Login} />
      <Route exact path="/mission-control/welcome" component={Welcome} />
      <Route exact path="/mission-control/create-project" component={CreateProject} />
      <Route exact path="/mission-control/projects/:projectID"
        component={props => (<Redirect to={`/mission-control/projects/${props.match.params.projectID}/overview`} />)} />
      <Route exact path="/mission-control/projects/:projectID/overview" component={Overview} />
      <Route exact path="/mission-control/projects/:projectID/user-management" component={UserManagement} />
      <Route exact path="/mission-control/projects/:projectID/database" component={Database} />
      <Route exact path="/mission-control/projects/:projectID/database/:selectedDB"
        component={props => (<Redirect to={`/mission-control/projects/${props.match.params.projectID}/database/${props.match.params.selectedDB}/overview`} />)} />
      <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/overview" component={DBOverview} />
      <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/rules" component={DBRules} />
      <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/schema" component={DBSchema} />
      <Route exact path="/mission-control/projects/:projectID/functions"
        component={props => (<Redirect to={`/mission-control/projects/${props.match.params.projectID}/functions/rules`} />)}
      />
      <Route exact path="/mission-control/projects/:projectID/functions/rules" component={FunctionRules} />
      <Route exact path="/mission-control/projects/:projectID/file-storage"
        component={props => (<Redirect to={`/mission-control/projects/${props.match.params.projectID}/file-storage/rules`} />)} />
      <Route exact path="/mission-control/projects/:projectID/file-storage/rules" component={FileStorageRules} />
      <Route exact path="/mission-control/projects/:projectID/event-triggers" component={EventTriggers} />
      <Route exact path="/mission-control/projects/:projectID/configure" component={Configure} />
      <Route exact path="/mission-control/projects/:projectID/explorer" component={Explorer} />
    </Router>
  );
};
