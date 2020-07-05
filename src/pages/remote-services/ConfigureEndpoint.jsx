import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import ReactGA from 'react-ga';
import ProjectPageLayout, { Content, InnerTopBar } from "../../components/project-page-layout/ProjectPageLayout";
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EndpointForm from '../../components/remote-services/endpoint-form/EndpointForm';
import { saveRemoteServiceEndpoint, getRemoteServiceEndpoints, getRemoteServiceURL } from '../../operations/remoteServices';

const ConfigureEndpoint = () => {
  // Router params
  const { projectID, serviceName, endpointName } = useParams();
  const history = useHistory()

  // Global state
  const endpoints = useSelector(state => getRemoteServiceEndpoints(state, serviceName))
  const serviceURL = useSelector(state => getRemoteServiceURL(state, serviceName))

  useEffect(() => {
    ReactGA.pageview(`/projects/remote-services/endpoints/${endpointName ? "edit" : "add"}`);
  }, []);

  const handleSaveEndpoint = (kind, name, method, path, rule, token, outputFormat, requestTemplate, responseTemplate, graphTemplate, headers) => {
    const isEndpointPresent = endpoints[name] ? true : false
    const endpointConfig = { kind, method, path, rule, token, template: "go", outputFormat, requestTemplate, responseTemplate, graphTemplate, headers }
    incrementPendingRequests()
    saveRemoteServiceEndpoint(projectID, serviceName, name, endpointConfig)
      .then(() => {
        notify("success", "Success", `${isEndpointPresent ? "Modified" : "Added"} endpoint successfully`)
        history.goBack()
      })
      .catch(ex => notify("error", `Error ${isEndpointPresent ? "modifying" : "adding"} endpoint`, ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='remote-services' />
      <ProjectPageLayout>
        <InnerTopBar title={endpointName ? "Edit endpoint" : "Add endpoint"} />
        <Content>
          <EndpointForm
            serviceURL={serviceURL}
            handleSubmit={handleSaveEndpoint}
            initialValues={endpointName ? Object.assign({}, endpoints[endpointName], { name: endpointName }) : undefined} />
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default ConfigureEndpoint;
