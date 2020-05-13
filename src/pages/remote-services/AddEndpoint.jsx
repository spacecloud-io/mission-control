import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'automate-redux';
import client from '../../client';
import { getProjectConfig, setProjectConfig, notify } from '../../utils';
import ReactGA from 'react-ga';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Input, Select, Form, Collapse, Checkbox, Alert } from 'antd';
import Topbar from '../../components/topbar/Topbar';
import Sidenav from '../../components/sidenav/Sidenav';
import EndpointForm from '../../components/remote-services/endpoint-form/EndpointForm';

const ServiceTopBar = ({ projectID, serviceName }) => {
  const history = useHistory();

  return (
    <div
      style={{
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
        height: 48,
        lineHeight: 48,
        zIndex: 98,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
      }}
    >
      <Button
        type='link'
        onClick={() =>
          history.goBack()
        }
      >
        <LeftOutlined />
        Go back
      </Button>
      <span style={{ marginLeft: 16 }}>Add endpoint</span>
    </div>
  );
};

const AddEndpoint = () => {
  // Router params
  const { projectID, serviceName } = useParams();
  const dispatch = useDispatch();

  const projects = useSelector(state => state.projects);
  const endpoints = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}.endpoints`, {})

  useEffect(() => {
    ReactGA.pageview('/projects/remote-services');
  }, []);

  const handleSubmit = (name, method, path, rule, token, template) => {
    const serviceConfig = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}`)
    const isEndpointPresent = endpoints[name] ? true : false
    const newEndpoints = Object.assign({}, endpoints, { [name]: { path, method, rule, token, template } })
    const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
    dispatch(increment("pendingRequests"))
    client.remoteServices.setServiceConfig(projectID, serviceName, newServiceConfig).then(() => {
      setProjectConfig(projectID, `modules.remoteServices.externalServices.${serviceName}`, newServiceConfig)
      notify("success", "Success", `${isEndpointPresent ? "Modified" : "Added"} endpoint successfully`)
    }).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='remote-services' />
      <div className='page-content page-content--no-padding'>
        <ServiceTopBar serviceName={serviceName} projectID={projectID} />
        <EndpointForm 
          handleSubmit={handleSubmit}
        />
      </div>
    </React.Fragment>
  );
};

export default AddEndpoint;
