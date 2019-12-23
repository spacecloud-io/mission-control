import React from "react";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import history from "./history";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import SignUp from "./pages/sign-up/SignUp"
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
import ManageServices from './pages/manage-services/ManageServices';
import Deployment from './pages/deployment/Deployment';

export default () => {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/"
          component={() => <Redirect to={"/mission-control"} />} />
        <Route exact path="/mission-control" component={Home} />
        <Route exact path="/mission-control/sign-in" component={Login} />
        <Route exact path="/mission-control/sign-up" component={SignUp} />
        <Route exact path="/mission-control/welcome" component={Welcome} />
        <Route exact path="/mission-control/create-project" component={CreateProject} />
        <Route exact path="/mission-control/projects/:projectID"
          component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/overview`} />} />
        <Route exact path="/mission-control/projects/:projectID/overview" component={Overview} />
        <Route exact path="/mission-control/projects/:projectID/database" component={DatabaseModulePage} />
        <Route exact path="/mission-control/projects/:projectID/database/add-db" component={AddDb} />
        <Route exact path="/mission-control/projects/:projectID/database/:selectedDB" component={DatabasePage} />
        <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/overview" component={DBOverview} />
        <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/rules" component={DBRules} />
        <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/schema" component={DBSchema} />
        <Route exact path="/mission-control/projects/:projectID/database/:selectedDB/settings" component={DBSettings} />
        <Route exact path="/mission-control/projects/:projectID/file-storage" component={FileStorage} />
        <Route exact path="/mission-control/projects/:projectID/event-triggers" component={EventTriggers} />
        <Route exact path="/mission-control/projects/:projectID/remote-services" component={RemoteServices} />
        <Route exact path="/mission-control/projects/:projectID/remote-services/:serviceName" component={RemoteService} />
        <Route exact path="/mission-control/projects/:projectID/user-management" component={UserManagement} />
        <Route exact path="/mission-control/projects/:projectID/explorer" component={Explorer} />
        <Route exact path="/mission-control/projects/:projectID/configure" component={Configure} />
        <Route exact path="/mission-control/projects/:projectID/manage-services" component={ManageServices} />
        <Route exact path="/mission-control/projects/:projectID/deployment" component={Deployment} />
      </Switch>
    </Router>
  );
};
