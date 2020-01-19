import React from "react";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import { PrivateRoute } from "./utils";
import history from "./history";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Welcome from "./pages/welcome/Welcome";
import CreateProject from "./pages/create-project/CreateProject";
import Overview from "./pages/overview/Overview";
import DatabaseModulePage from "./pages/database/Index";
import DatabasePage from "./pages/database/Database";
import DBOverview from "./pages/database/overview/DBOverview";
import DBRules from "./pages/database/rules/DBRules";
import DBSchema from "./pages/database/schema/DBSchema";
import DBSettings from "./pages/database/settings/DBSettings";
import FileStorage from "./pages/file-storage/FileStorage";
import EventTriggers from "./pages/event-triggers/EventTriggers";
import RemoteServices from "./pages/remote-services/Index";
import RemoteService from "./pages/remote-services/RemoteService";
import UserManagement from "./pages/user-management/UserManagement";
import Explorer from "./pages/explorer/Explorer";
import Configure from "./pages/configure/configure";
import AddDb from './pages/database/add-db/AddDb';
import Guides from './pages/Guides/Guides'
import Teams from './pages/Teams/Teams'
import Plans from './pages/Plans/Plans'

export default () => {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/"
          component={() => <Redirect to={"/mission-control"} />} />
        <Route exact path="/mission-control" component={Home} />
        <Route exact path="/mission-control/login" component={Login} />
        <PrivateRoute exact path="/mission-control/welcome" component={Welcome} />
        <PrivateRoute exact path="/mission-control/create-project" component={CreateProject} />
        <PrivateRoute exact path="/mission-control/projects/:projectID"
          component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/overview`} />} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/overview" component={Overview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database" component={DatabaseModulePage} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/add-db" component={AddDb} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB" component={DatabasePage} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/overview" component={DBOverview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/rules" component={DBRules} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/schema" component={DBSchema} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/settings" component={DBSettings} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/file-storage" component={FileStorage} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/event-triggers" component={EventTriggers} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services" component={RemoteServices} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services/:serviceName" component={RemoteService} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/user-management" component={UserManagement} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/explorer" component={Explorer} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/configure" component={Configure} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/guides" component={Guides} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/teams" component={Teams} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/billing" component={Plans} />
      </Switch>
    </Router>
  );
};
