import React, { useEffect } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from "react-redux"
import { notify, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from "../../utils"
import ReactGA from 'react-ga';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Table, Popconfirm } from "antd";
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import endpointImg from "../../assets/structure.svg"
import { endpointTypes, securityRuleGroups, projectModules, actionQueuedMessage } from "../../constants"
import { deleteRemoteServiceEndpoint, getRemoteServiceEndpoints } from "../../operations/remoteServices"

const ServiceTopBar = ({ projectID, serviceName }) => {

  const history = useHistory()

  return (
    <div style={{
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
      height: 48,
      lineHeight: 48,
      zIndex: 98,
      display: "flex",
      alignItems: "center",
      padding: "0 16px"
    }}>
      <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services`)}>
        <LeftOutlined />
        Go back
        </Button>
      <span style={{ marginLeft: 16 }}>
        {serviceName}
      </span>
    </div>
  );
}

const RemoteService = () => {
  // Router params
  const { projectID, serviceName } = useParams()

  const history = useHistory()

  useEffect(() => {
    ReactGA.pageview("/projects/remote-services/endpoints");
  }, [])

  // Global state
  const endpoints = useSelector(state => getRemoteServiceEndpoints(state, serviceName))

  // Derived state
  const endpointsTableData = Object.entries(endpoints).map(([name, { path, kind, method }]) => ({ name, method, path, kind }))
  const noOfEndpoints = endpointsTableData.length

  // Handlers
  const handleDelete = (name) => {
    incrementPendingRequests()
    deleteRemoteServiceEndpoint(projectID, serviceName, name)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Removed endpoint successfully"))
      .catch((ex) => notify("error", "Error removing endpoint", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleSecureClick = (endpoint) => openSecurityRulesPage(projectID, securityRuleGroups.REMOTE_SERVICES, endpoint, serviceName)

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Endpoint type',
      render: (_, { kind = endpointTypes.INTERNAL }) => {
        switch (kind) {
          case endpointTypes.INTERNAL:
            return "Internal"
          case endpointTypes.EXTERNAL:
            return "External"
          case endpointTypes.PREPARED:
            return "Space Cloud"
        }
      }
    },
    {
      title: 'Method',
      render: (_, { kind, method }) => kind === endpointTypes.PREPARED ? "POST" : method
    },
    {
      title: 'Path',
      render: (_, { kind, path }) => kind === endpointTypes.PREPARED ? `http://localhost:4122/v1/api/${projectID}/graphql` : path
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span>
          <a onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services/${serviceName}/endpoints/${name}/edit`)}>Edit</a>
          <a onClick={() => handleSecureClick(name)}>Secure</a>
          <Popconfirm title={`This will remove this endpoint from this service. Are you sure?`} onConfirm={() => handleDelete(name)}>
            <a style={{ color: "red" }}>Remove</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.REMOTE_SERVICES} />
      <div className='page-content page-content--no-padding'>
        <ServiceTopBar serviceName={serviceName} projectID={projectID} />
        <div style={{ padding: "32px 32px 0" }}>
          {noOfEndpoints === 0 && <div style={{ marginTop: 24 }}>
            <div className="panel">
              <img src={endpointImg} className="remote-img" />
              <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>A service can have multiple endpoints that can be accessed from the frontend.</p>
              <Button style={{ marginTop: 16, marginBottom: 80 }} type="primary" className="action-rounded" onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services/${serviceName}/endpoints/add`)}>Add first endpoint</Button>
            </div>
          </div>}
          {noOfEndpoints > 0 && (
            <React.Fragment>
              <h3 style={{ display: "flex", justifyContent: "space-between" }}>Endpoints <Button onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services/${serviceName}/endpoints/add`)} type="primary">Add</Button></h3>
              <Table columns={tableColumns} dataSource={endpointsTableData} pagination={false} />
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default RemoteService