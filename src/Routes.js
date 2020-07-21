import React from "react";
import { Router, Route, Redirect, Switch } from "react-router-dom";
import { PrivateRoute } from "./utils";
import history from "./history";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Welcome from "./pages/welcome/Welcome";
import CreateProject from "./pages/create-project/CreateProject";
import DatabaseIndexPage from "./pages/database/Index";
import DatabaseEmptyStatePage from "./pages/database/empty-state/EmptyState";
import Overview from "./pages/overview/Overview";
import DatabasePage from "./pages/database/Database";
import DBOverview from "./pages/database/overview/DBOverview";
import DBBrowse from "./pages/database/browse/DBBrowse";
import DBSettings from "./pages/database/settings/DBSettings";
import DBQueries from "./pages/database/queries/DBQueries";
import AddDb from "./pages/database/add-db/AddDb";
import PreparedQueries from './pages/database/prepared-queries/PreparedQueries';
import AddPreparedQueries from './pages/database/prepared-queries/AddPreparedQueries';
import FileStorageIndex from "./pages/file-storage/FileStorageIndex";
import FileStorage from "./pages/file-storage/FileStorage";
import FileStorageConfig from "./pages/file-storage/FileStorageConfig";
import EventingIndex from "./pages/eventing/Index";
import EventingOverview from "./pages/eventing/EventingOverview";
import EventingRules from "./pages/eventing/EventingRules";
import EventingSchema from "./pages/eventing/EventingSchema";
import EventingLogs from "./pages/eventing/EventingLogs";
import EventingSettings from "./pages/eventing/EventingSettings";
import QueueEvent from "./pages/eventing/queue-event/QueueEvent";
import RemoteServicesIndex from "./pages/remote-services/RemoteServicesIndex";
import RemoteServices from "./pages/remote-services/Index";
import Endpoints from "./pages/remote-services/Endpoints";
import ConfigureEndpoint from "./pages/remote-services/ConfigureEndpoint";
import UserManagement from "./pages/user-management/UserManagement";
import DeploymentsIndex from "./pages/deployments/Index";
import DeploymentsOverview from "./pages/deployments/overview/DeploymentsOverview";
import DeploymentsRoutes from "./pages/deployments/routes/DeploymentsRoutes";
import Graphql from "./pages/explorer/graphql/Graphql";
import SpaceApi from "./pages/explorer/spaceApi/SpaceApi";
import ProjectSettings from "./pages/settings/project/ProjectSettings";
import ClusterSettings from "./pages/settings/cluster/ClusterSettings";
import ApplyLicense from "./pages/settings/apply-license/ApplyLicense";
import RoutingOverview from './pages/routing/overview/Overview';
import RoutingSettings from './pages/routing/settings/Settings';
import SecretsIndex from "./pages/secrets/Index";
import Secrets from './pages/secrets/Secrets';
import SecretDetails from './pages/secrets/SecretDetails';
import ExploreIntegration from './pages/integration/ExploreIntegration';
import InstalledIntegration from './pages/integration/InstalledIntegration';
import InstallIntegration from './pages/integration/InstallIntegration';
import IntegrationDetails from './pages/integration/IntegrationDetails';
import IntegrationPermissions from './pages/integration/IntegrationPermissions';
import RulesEditor from './pages/security-rules/RulesEditor';

export default () => {
  return (
    <Router history={history}>
      <Route exact path="/"
        component={() => <Redirect to={"/mission-control"} />} />
      <Route exact path="/mission-control" component={Home} />
      <Route exact path="/mission-control/login" component={Login} />
      <PrivateRoute exact path="/mission-control/welcome" component={Welcome} />
      <PrivateRoute exact path="/mission-control/create-project" component={CreateProject} />
      <PrivateRoute exact path="/mission-control/projects/:projectID"
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/overview`} />} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/overview" component={Overview} />
      <PrivateRoute path="/mission-control/projects/:projectID/database" component={DatabaseIndexPage} />
      <Switch>
        <PrivateRoute exact path="/mission-control/projects/:projectID/database" component={DatabaseEmptyStatePage} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/add-db" component={AddDb} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB" component={DatabasePage} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/overview" component={DBOverview} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/browse" component={DBBrowse} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/settings" component={DBSettings} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/queries" component={DBQueries} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/prepared-queries" component={PreparedQueries} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/prepared-queries/add" component={AddPreparedQueries} />
        <PrivateRoute exact path="/mission-control/projects/:projectID/database/:selectedDB/prepared-queries/:preparedQueryId/edit" component={AddPreparedQueries} />
      </Switch>
      <PrivateRoute path="/mission-control/projects/:projectID/file-storage" component={FileStorageIndex} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/file-storage" component={FileStorage} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/file-storage/configure" component={FileStorageConfig} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/settings"
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/settings/project`} />} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/settings/project" component={ProjectSettings} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/settings/cluster" component={ClusterSettings} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/settings/apply-license" component={ApplyLicense} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/ingress-routes"
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/ingress-routes/overview`} />} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/ingress-routes/overview" component={RoutingOverview} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/ingress-routes/settings" component={RoutingSettings} />
      <PrivateRoute path="/mission-control/projects/:projectID/eventing" component={EventingIndex} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/overview" component={EventingOverview} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/rules" component={EventingRules} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/schema" component={EventingSchema} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/event-logs" component={EventingLogs} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/settings" component={EventingSettings} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/eventing/queue-event" component={QueueEvent} />
      <PrivateRoute path="/mission-control/projects/:projectID/remote-services" component={RemoteServicesIndex} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services" component={RemoteServices} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services/:serviceName" component={Endpoints} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services/:serviceName/endpoints/add" component={ConfigureEndpoint} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/remote-services/:serviceName/endpoints/:endpointName/edit" component={ConfigureEndpoint} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/userman" component={UserManagement} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/explorer"
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/explorer/graphql`} />} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/explorer/graphql" component={Graphql} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/explorer/spaceApi" component={SpaceApi} />
      <PrivateRoute path="/mission-control/projects/:projectID/deployments" component={DeploymentsIndex} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/deployments/overview" component={DeploymentsOverview} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/deployments/routes" component={DeploymentsRoutes} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/security-rules/editor" component={RulesEditor} />
      <PrivateRoute path="/mission-control/projects/:projectID/secrets" component={SecretsIndex} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/secrets" component={Secrets} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/secrets/:secretId" component={SecretDetails} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/integration"
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/integration/explore`} />} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/integration/explore" component={ExploreIntegration} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/integration/installed" component={InstalledIntegration} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/integration/details/:integrationid" component={IntegrationDetails} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/integration/install/:integrationid" component={InstallIntegration} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/integration/permissions/:integrationid" component={IntegrationPermissions} />
    </Router>
  );
};
