import React from "react";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import { PrivateRoute } from "./utils";
import history from "./history";

import EmailActionHandler from "./pages/email-action-handler/EmailActionHandler";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Signup from "./pages/signup/Signup";
import EmailVerification from "./pages/signup/EmailVerification";
import Welcome from "./pages/welcome/Welcome";
import CreateProject from "./pages/create-project/CreateProject";
import Overview from "./pages/overview/Overview";
import DatabaseModulePage from "./pages/database/Index";
import DatabasePage from "./pages/database/Database";
import DBOverview from "./pages/database/overview/DBOverview";
import DBRules from "./pages/database/rules/DBRules";
import DBSchema from "./pages/database/schema/DBSchema";
import DBSettings from "./pages/database/settings/DBSettings";
import AddDb from "./pages/database/add-db/AddDb";
import FileStorage from "./pages/file-storage/FileStorage";
import EventingOverview from "./pages/eventing/EventingOverview";
import EventingRules from "./pages/eventing/EventingRules";
import EventingSchema from "./pages/eventing/EventingSchema";
import EventingLogs from "./pages/eventing/EventingLogs";
import EventingSettings from "./pages/eventing/EventingSettings";
import RemoteServices from "./pages/remote-services/Index";
import RemoteService from "./pages/remote-services/RemoteService";
import UserManagement from "./pages/user-management/UserManagement";
import DeploymentsOverview from "./pages/deployments/overview/DeploymentsOverview";
import DeploymentsRules from "./pages/deployments/rules/DeploymentsRules";
import Explorer from "./pages/explorer/Explorer";
import Settings from "./pages/settings/Settings";
import Routing from './pages/routing/Routing';
import Guides from './pages/guides/Guides';
import Teams from './pages/teams/Teams';
import Billing from './pages/billing/Billing';
import Secrets from './pages/secrets/Secrets';
import SecretDetails from './pages/secrets/SecretDetails';
import Clusters from './pages/clusters/Clusters'

export default () => {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/"
          component={() => <Redirect to={"/mission-control"} />} />
        <Route path="/mission-control/email-action-handler" component={EmailActionHandler} />
        <Route exact path="/mission-control" component={Home} />
        <Route exact path="/mission-control/login" component={Login} />
        <Route exact path="/mission-control/signup" component={() => <Signup mode='signup' />} />
        <Route exact path="/mission-control/email-verification" component={EmailVerification} />
        <Route exact path="/mission-control/signin" component={() => <Signup mode='signin' />} />
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
        <PrivateRoute exact path="/mission-control/projects/:projectID/settings" component={Settings} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/routing" component={Routing} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/overview" component={EventingOverview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/rules" component={EventingRules} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/schema" component={EventingSchema} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/event-logs" component={EventingLogs} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/settings" component={EventingSettings} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services" component={RemoteServices} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services/:serviceName" component={RemoteService} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/auth" component={UserManagement} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/explorer" component={Explorer} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/clusters" component={Clusters} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/deployments"
          component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/deployments/overview`} />} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/deployments/overview" component={DeploymentsOverview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/deployments/rules" component={DeploymentsRules} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/guides" component={Guides} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/teams" component={Teams} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/billing" component={Billing} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/secrets" component={Secrets} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/secrets/:secretName" component={SecretDetails} />
      </Switch>
    </Router>
  );
};
