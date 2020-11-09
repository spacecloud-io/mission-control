import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import ProjectPageLayout, { Content, InnerTopBar } from "../../components/project-page-layout/ProjectPageLayout";
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EndpointForm from '../../components/remote-services/endpoint-form/EndpointForm';
import { saveRemoteServiceEndpoint, getRemoteServiceEndpoints, getRemoteServiceURL } from '../../operations/remoteServices';
import { projectModules, actionQueuedMessage } from '../../constants';
import { getCacheConfig } from '../../operations/cache';

const ConfigureEndpoint = () => {
  // Router params
  const { projectID, serviceName, endpointName } = useParams();
  const history = useHistory()

  // Global state
  const endpoints = useSelector(state => getRemoteServiceEndpoints(state, serviceName))
  const serviceURL = useSelector(state => getRemoteServiceURL(state, serviceName))
  const cacheConfig = useSelector(state => getCacheConfig(state))

  const handleSaveEndpoint = (endpointConfig) => {
    const name = endpointConfig.name;
    const isEndpointPresent = endpoints[name] ? true : false
    incrementPendingRequests()
    saveRemoteServiceEndpoint(projectID, serviceName, name, endpointConfig)
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : `${isEndpointPresent ? "Modified" : "Added"} endpoint successfully`)
        history.goBack()
      })
      .catch(ex => notify("error", `Error ${isEndpointPresent ? "modifying" : "adding"} endpoint`, ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.REMOTE_SERVICES} />
      <ProjectPageLayout>
        <InnerTopBar title={endpointName ? "Edit endpoint" : "Add endpoint"} />
        <Content>
          <EndpointForm
            serviceURL={serviceURL}
            handleSubmit={handleSaveEndpoint}
            initialValues={endpointName ? Object.assign({}, endpoints[endpointName], { name: endpointName }) : undefined}
            isCachingEnabled={cacheConfig.enabled} />
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default ConfigureEndpoint;
