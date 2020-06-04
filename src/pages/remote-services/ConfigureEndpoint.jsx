import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'automate-redux';
import client from '../../client';
import { getProjectConfig, setProjectConfig, notify } from '../../utils';
import ReactGA from 'react-ga';
import ProjectPageLayout, { Content, InnerTopBar } from "../../components/project-page-layout/ProjectPageLayout";
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EndpointForm from '../../components/remote-services/endpoint-form/EndpointForm';

const ConfigureEndpoint = () => {
  // Router params
  const { projectID, serviceName, endpointName } = useParams();

  const dispatch = useDispatch();
  const history = useHistory()

  const projects = useSelector(state => state.projects);
  const endpoints = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}.endpoints`, {})

  useEffect(() => {
    ReactGA.pageview(`/projects/remote-services/endpoints/${endpointName ? "edit" : "add"}`);
  }, []);

  const handleSaveEndpoint = (kind, name, method, path, rule, token, outputFormat, requestTemplate, responseTemplate, graphTemplate) => {
    const serviceConfig = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}`)
    const isEndpointPresent = endpoints[name] ? true : false
    const newEndpoints = Object.assign({}, endpoints, { [name]: { kind, method, path, rule, token, template: "go", outputFormat, requestTemplate, responseTemplate, graphTemplate } })
    const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
    dispatch(increment("pendingRequests"))
    client.remoteServices.setServiceConfig(projectID, serviceName, newServiceConfig)
      .then(() => {
        setProjectConfig(projectID, `modules.remoteServices.externalServices.${serviceName}`, newServiceConfig)
        notify("success", "Success", `${isEndpointPresent ? "Modified" : "Added"} endpoint successfully`)
        history.goBack()
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='remote-services' />
      <ProjectPageLayout>
        <InnerTopBar title={endpointName ? "Edit endpoint" : "Add endpoint"} />
        <Content>
          <EndpointForm
            handleSubmit={handleSaveEndpoint}
            initialValues={endpointName ? Object.assign({}, endpoints[endpointName], { name: endpointName }) : undefined} />
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default ConfigureEndpoint;
