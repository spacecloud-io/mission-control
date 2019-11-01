import React from "react";
import { Router, Route, Redirect } from "react-router-dom";
import history from "./history";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Database from "./pages/database/Database";
import UserManagement from "./pages/user-management/UserManagement";
import FileStorage from "./pages/file-storage/FileStorage";
import Configure from "./pages/configure/configure";
import Overview from "./pages/overview/Overview";
import Welcome from "./pages/welcome/Welcome";
import CreateProject from "./pages/create-project/CreateProject";
import Explorer from "./pages/explorer/Explorer";

import DBOverview from "./pages/database/overview/DBOverview";
import DBRules from "./pages/database/rules/DBRules";
import DBSchema from "./pages/database/schema/DBSchema";
import DBSettings from "./pages/database/settings/DBSettings";
import EventTriggers from "./pages/event-triggers/EventTriggers";
import RemoteServices from "./pages/remote-services/Index";
import RemoteService from "./pages/remote-services/RemoteService";

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
      <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/settings" component={DBSettings} />
      <Route exact path="/mission-control/projects/:projectID/file-storage" component={FileStorage} />
      <Route exact path="/mission-control/projects/:projectID/remote-services" component={RemoteServices} />
      <Route exact path="/mission-control/projects/:projectID/remote-services/:serviceName" component={RemoteService} />
      <Route exact path="/mission-control/projects/:projectID/event-triggers" component={EventTriggers} />
      <Route exact path="/mission-control/projects/:projectID/configure" component={Configure} />
      <Route exact path="/mission-control/projects/:projectID/explorer" component={Explorer} />
    </Router>
  );
};
