import React, { useEffect } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { increment, decrement } from "automate-redux"
import client from "../../client"
import { getProjectConfig, setProjectConfig, notify } from "../../utils"
import ReactGA from 'react-ga';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Table, Popconfirm } from "antd";
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import endpointImg from "../../assets/structure.svg"

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
  const dispatch = useDispatch()

  const history = useHistory()

  useEffect(() => {
    ReactGA.pageview("/projects/remote-services/endpoints");
  }, [])

  // Global state
  const projects = useSelector(state => state.projects)

  // Derived state
  const endpoints = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}.endpoints`, {})
  const endpointsTableData = Object.entries(endpoints).map(([name, { path, method }]) => ({ name, method, path }))
  const noOfEndpoints = endpointsTableData.length

  const handleDelete = (name) => {
    const serviceConfig = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}`)
    const newEndpoints = Object.assign({}, endpoints)
    delete newEndpoints[name]
    const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
    dispatch(increment("pendingRequests"))
    client.remoteServices.setServiceConfig(projectID, serviceName, newServiceConfig).then(() => {
      setProjectConfig(projectID, `modules.remoteServices.externalServices.${serviceName}`, newServiceConfig)
      notify("success", "Success", "Removed endpoint successfully")
    }).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
  }

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path'
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span>
          <a onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services/${serviceName}/endpoints/${name}/edit`)}>Edit</a>
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
      <Sidenav selectedItem='remote-services' />
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