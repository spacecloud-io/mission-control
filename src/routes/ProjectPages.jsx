import React from "react";
import { PrivateRoute, DatabasePageRoute } from "../utils";
import { Route, Redirect, Switch } from "react-router-dom";
import { projectModules } from "../constants";

import NoPermissions from "../pages/no-permissions/NoPermissions";
import DatabaseIndexPage from "../pages/database/Index";
import DatabaseEmptyStatePage from "../pages/database/empty-state/EmptyState";
import Overview from "../pages/overview/Overview";
import DatabasePage from "../pages/database/Database";
import DBOverview from "../pages/database/overview/DBOverview";
import DBBrowse from "../pages/database/browse/DBBrowse";
import DBSettings from "../pages/database/settings/DBSettings";
import DBQueries from "../pages/database/queries/DBQueries";
import AddDb from "../pages/database/add-db/AddDb";
import PreparedQueries from '../pages/database/prepared-queries/PreparedQueries';
import AddPreparedQueries from '../pages/database/prepared-queries/AddPreparedQueries';
import FileStorageIndex from "../pages/file-storage/FileStorageIndex";
import FileStorage from "../pages/file-storage/FileStorage";
import FileStorageConfig from "../pages/file-storage/FileStorageConfig";
import EventingIndex from "../pages/eventing/Index";
import EventingOverview from "../pages/eventing/EventingOverview";
import EventingRules from "../pages/eventing/EventingRules";
import EventingSchema from "../pages/eventing/EventingSchema";
import EventingLogs from "../pages/eventing/EventingLogs";
import EventingSettings from "../pages/eventing/EventingSettings";
import QueueEvent from "../pages/eventing/queue-event/QueueEvent";
import RemoteServicesIndex from "../pages/remote-services/RemoteServicesIndex";
import RemoteServices from "../pages/remote-services/Index";
import Endpoints from "../pages/remote-services/Endpoints";
import ConfigureEndpoint from "../pages/remote-services/ConfigureEndpoint";
import UserManagement from "../pages/user-management/UserManagement";
import DeploymentsIndex from "../pages/deployments/Index";
import DeploymentsOverview from "../pages/deployments/overview/DeploymentsOverview";
import DeploymentsRoutes from "../pages/deployments/routes/DeploymentsRoutes";
import DeploymentsRoles from "../pages/deployments/roles/DeploymentsRoles";
import ServiceRoleForm from "../pages/deployments/roles/ServiceRoleForm";
import DeploymentsLogs from "../pages/deployments/deployment-logs/DeploymentLogs";
import ConfigureDeployment from "../pages/deployments/configure-deployment/ConfigureDeployment";
import Graphql from "../pages/explorer/graphql/Graphql";
import SpaceApi from "../pages/explorer/spaceApi/SpaceApi";
import ProjectSettings from "../pages/settings/project/ProjectSettings";
import ClusterSettings from "../pages/settings/cluster/ClusterSettings";
import LicenseSettings from "../pages/settings/license/LicenseSettings";
import ApplyLicense from "../pages/settings/apply-license/ApplyLicense";
import RoutingOverview from '../pages/routing/overview/Overview';
import RoutingSettings from '../pages/routing/settings/Settings';
import SecretsIndex from "../pages/secrets/Index";
import Secrets from '../pages/secrets/Secrets';
import SecretDetails from '../pages/secrets/SecretDetails';
import IntegrationsIndex from '../pages/integrations/Index';
import ExploreIntegrations from '../pages/integrations/ExploreIntegrations';
import InstalledIntegrations from '../pages/integrations/InstalledIntegrations';
import InstallIntegration from '../pages/integrations/InstallIntegration';
import IntegrationDetails from '../pages/integrations/IntegrationDetails';
import IntegrationPermissions from '../pages/integrations/IntegrationPermissions';
import ConfigureCache from '../pages/cache/configure-cache/ConfigureCache';
import CacheOverview from '../pages/cache/overview/Overview';
import CacheIndex from '../pages/cache/Index';
import ConfigureRabbitMQ from "../pages/settings/add-ons/rabbit-mq/RabbitMQ";
import ConfigureRedis from "../pages/settings/add-ons/redis/ConfigureRedis";
// import AddOns from "../pages/settings/add-ons/AddOns";


function ProjectPages() {
  return (
    <React.Fragment>
      <PrivateRoute exact path="/mission-control/projects/:projectID"
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/overview`} />} />
      <PrivateRoute exact path="/mission-control/projects/:projectID/overview" component={Overview} />
      <Route path="/mission-control/projects/:projectID/no-permissions" component={NoPermissions} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.DATABASE}`} component={DatabaseIndexPage} />
      <Switch>
        <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}`} component={DatabaseEmptyStatePage} />
        <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/add-db`} component={AddDb} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB`} component={DatabasePage} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/overview`} component={DBOverview} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/browse`} component={DBBrowse} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/settings`} component={DBSettings} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/queries`} component={DBQueries} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/prepared-queries`} component={PreparedQueries} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/prepared-queries/add`} component={AddPreparedQueries} />
        <DatabasePageRoute exact path={`/mission-control/projects/:projectID/${projectModules.DATABASE}/:selectedDB/prepared-queries/:preparedQueryId/edit`} component={AddPreparedQueries} />
      </Switch>
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.FILESTORE}`} component={FileStorageIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.FILESTORE}`} component={FileStorage} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.FILESTORE}/configure`} component={FileStorageConfig} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.CACHE}`} component={CacheIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.CACHE}`} component={CacheOverview} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.CACHE}/configure`} component={ConfigureCache} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}`}
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/settings/project`} />} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/project`} component={ProjectSettings} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/cluster`} component={ClusterSettings} />
      {/* <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/add-ons`} component={AddOns} /> */}
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/add-ons/configure/rabbit-mq`} component={ConfigureRabbitMQ} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/add-ons/configure/redis`} component={ConfigureRedis} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/license`} component={LicenseSettings} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SETTINGS}/apply-license`} component={ApplyLicense} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INGRESS_ROUTES}`}
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/${projectModules.INGRESS_ROUTES}/overview`} />} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INGRESS_ROUTES}/overview`} component={RoutingOverview} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INGRESS_ROUTES}/settings`} component={RoutingSettings} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.EVENTING}`} component={EventingIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}`}
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/${projectModules.EVENTING}/overview`} />} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}/overview`} component={EventingOverview} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}/rules`} component={EventingRules} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}/schema`} component={EventingSchema} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}/event-logs`} component={EventingLogs} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}/settings`} component={EventingSettings} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EVENTING}/queue-event`} component={QueueEvent} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.REMOTE_SERVICES}`} component={RemoteServicesIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.REMOTE_SERVICES}`} component={RemoteServices} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.REMOTE_SERVICES}/:serviceName`} component={Endpoints} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.REMOTE_SERVICES}/:serviceName/endpoints/add`} component={ConfigureEndpoint} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.REMOTE_SERVICES}/:serviceName/endpoints/:endpointName/edit`} component={ConfigureEndpoint} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.USER_MANAGEMENT}`} component={UserManagement} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EXPLORER}`}
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/${projectModules.EXPLORER}/graphql`} />} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EXPLORER}/graphql`} component={Graphql} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.EXPLORER}/spaceApi`} component={SpaceApi} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}`} component={DeploymentsIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}`} component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/${projectModules.DEPLOYMENTS}/overview`} />} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/overview`} component={DeploymentsOverview} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/configure`} component={ConfigureDeployment} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/routes`} component={DeploymentsRoutes} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/logs`} component={DeploymentsLogs} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/roles`} component={DeploymentsRoles} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/roles/add`} component={ServiceRoleForm} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.DEPLOYMENTS}/roles/:roleName/edit`} component={ServiceRoleForm} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.SECRETS}`} component={SecretsIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SECRETS}`} component={Secrets} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.SECRETS}/:secretId`} component={SecretDetails} />
      <PrivateRoute path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}`} component={IntegrationsIndex} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}`}
        component={props => <Redirect to={`/mission-control/projects/${props.match.params.projectID}/${projectModules.INTEGRATIONS}/explore`} />} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}/explore`} component={ExploreIntegrations} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}/installed`} component={InstalledIntegrations} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}/details/:integrationId`} component={IntegrationDetails} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}/install/:integrationId`} component={InstallIntegration} />
      <PrivateRoute exact path={`/mission-control/projects/:projectID/${projectModules.INTEGRATIONS}/permissions/:integrationId`} component={IntegrationPermissions} />
    </React.Fragment>
  )
}

export default ProjectPages