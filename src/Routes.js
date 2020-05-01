import React from "react";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import { PrivateRoute, BillingRoute } from "./utils";
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
import DBQueries from "./pages/database/queries/DBQueries";
import AddDb from "./pages/database/add-db/AddDb";
import FileStorage from "./pages/file-storage/FileStorage";
import EventingOverview from "./pages/eventing/EventingOverview";
import EventingRules from "./pages/eventing/EventingRules";
import EventingSchema from "./pages/eventing/EventingSchema";
import EventingLogs from "./pages/eventing/EventingLogs";
import EventingSettings from "./pages/eventing/EventingSettings";
import QueueEvent from "./pages/eventing/queue-event/QueueEvent";
import RemoteServices from "./pages/remote-services/Index";
import RemoteService from "./pages/remote-services/RemoteService";
import UserManagement from "./pages/user-management/UserManagement";
import DeploymentsOverview from "./pages/deployments/overview/DeploymentsOverview";
import DeploymentsRoutes from "./pages/deployments/routes/DeploymentsRoutes";
import Graphql from "./pages/explorer/graphql/Graphql";
import SpaceApi from "./pages/explorer/spaceApi/SpaceApi";
import Settings from "./pages/settings/Settings";
import Routing from './pages/routing/Routing';
import Guides from './pages/guides/Guides';
import Teams from './pages/teams/Teams';
import Billing from './pages/billing/Billing';
import BillingOverview from './pages/billing/BillingOverview';
import BillingInvoices from './pages/billing/BillingInvoices';
import UpgradeCluster from './pages/billing/UpgradeCluster';
import ChangePlan from './pages/billing/ChangePlan';
import ContactUs from './pages/billing/ContactUs';
import Secrets from './pages/secrets/Secrets';
import SecretDetails from './pages/secrets/SecretDetails';

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
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/queries" component={DBQueries} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/file-storage" component={FileStorage} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/settings" component={Settings} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/ingress-routes" component={Routing} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/overview" component={EventingOverview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/rules" component={EventingRules} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/schema" component={EventingSchema} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/event-logs" component={EventingLogs} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/settings" component={EventingSettings} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/queue-event" component={QueueEvent} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services" component={RemoteServices} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services/:serviceName" component={RemoteService} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/userman" component={UserManagement} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/explorer"
          component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/explorer/graphql`} />} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/explorer/graphql" component={Graphql} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/explorer/spaceApi" component={SpaceApi} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/deployments"
          component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/deployments/overview`} />} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/deployments/overview" component={DeploymentsOverview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/deployments/routes" component={DeploymentsRoutes} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/guides" component={Guides} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/teams" component={Teams} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/billing" component={Billing} />
        <BillingRoute exact path="/mission-control/projects/:projectID/billing/overview" component={BillingOverview} />
        <BillingRoute exact path="/mission-control/projects/:projectID/billing/invoices" component={BillingInvoices} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/billing/upgrade-cluster" component={UpgradeCluster} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/billing/change-plan" component={ChangePlan} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/billing/contact-us" component={ContactUs} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/secrets" component={Secrets} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/secrets/:secretId" component={SecretDetails} />
      </Switch>
    </Router>
  );
};
