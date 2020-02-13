import React, { useState } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { increment, decrement } from "automate-redux"
import client from "../../client"
import { getProjectConfig, setProjectConfig, notify } from "../../utils"

import { Button, Table, Popconfirm, Icon } from "antd"
import EndpointForm from "../../components/remote-services/endpoint-form/EndpointForm"
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import endpointImg from "../../assets/structure.svg"
import { setRemoteService } from "../../actions/remoteService"

const ServiceTopBar = ({ projectID, serviceName }) => {

  const history = useHistory()

  return <div style={{
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
    height: 48,
    lineHeight: 48,
    zIndex: 98,
    display: "flex",
    alignItems: "center",
    padding: "0 16px"
  }}>
    <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services`)}>
      <Icon type="left" />
      Go back
      </Button>
    <span style={{ marginLeft: 16 }}>
      {serviceName}
    </span>
  </div>
}

const RemoteService = () => {
  // Router params
  const { projectID, serviceName } = useParams()

  const dispatch = useDispatch()

  // Global state
  const projects = useSelector(state => state.projects)

  // Component state
  const [modalVisible, setModalVisible] = useState(false)
  const [endpointClicked, setEdnpointClicked] = useState("")

  // Derived state
  const serviceURL = getProjectConfig(projectID, `modules.services.externalServices.${serviceName}.url`)
  const endpoints = getProjectConfig(projectID, `modules.services.externalServices.${serviceName}.endpoints`, {})
  const endpointsTableData = Object.entries(endpoints).map(([name, { path, method }]) => ({ name, method, path }))
  const noOfEndpoints = endpointsTableData.length
  const endpointClickedInfo = endpointClicked ? { name: endpointClicked, ...endpoints[endpointClicked] } : undefined

  // Handlers
  const handleEditClick = (name) => {
    setEdnpointClicked(name)
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setEdnpointClicked("")
  }

  const handleSubmit = (name, method, path, rule) => {
    const serviceConfig = getProjectConfig(projectID, `modules.services.externalServices.${serviceName}`)
    const isEndpointPresent = endpoints[name] ? true : false
    const newEndpoints = Object.assign({}, endpoints, { [name]: { path, method, rule } })
    const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
    dispatch(increment("pendingRequests"))
    setRemoteService(projectID, serviceName, newServiceConfig)
      .then(() => notify("success", "Success", `${isEndpointPresent ? "Modified" : "Added"} endpoint successfully`))
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleDelete = (name) => {
    const serviceConfig = getProjectConfig(projectID, `modules.services.externalServices.${serviceName}`)
    const newEndpoints = Object.assign({}, endpoints)
    delete newEndpoints[name]
    const newServiceConfig = Object.assign({}, serviceConfig, { endpoints: newEndpoints })
    dispatch(increment("pendingRequests"))
    setRemoteService(projectID, name, newServiceConfig)
      .then(() => notify("success", "Success", "Removed endpoint successfully"))
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
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
          <a onClick={() => handleEditClick(name)}>Edit</a>
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
              <Button style={{ marginTop: 16, marginBottom: 80 }} type="primary" className="action-rounded" onClick={() => setModalVisible(true)}>Add first endpoint</Button>
            </div>
          </div>}
          {noOfEndpoints > 0 && (
            <React.Fragment>
              <h3 style={{ display: "flex", justifyContent: "space-between" }}>Endpoints <Button onClick={() => setModalVisible(true)} type="primary">Add</Button></h3>
              <Table columns={tableColumns} dataSource={endpointsTableData} />
            </React.Fragment>
          )}
          {modalVisible && <EndpointForm
            url={serviceURL}
            initialValues={endpointClickedInfo}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
          />}
        </div>
      </div>
    </React.Fragment>
  )
}

export default RemoteService