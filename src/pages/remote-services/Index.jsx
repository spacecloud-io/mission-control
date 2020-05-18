import React, { useState, useEffect } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { increment, decrement } from "automate-redux"
import ReactGA from 'react-ga';
import client from "../../client"
import { getProjectConfig, setProjectConfig, notify } from "../../utils"

import { Button, Table, Popconfirm } from "antd"
import ServiceForm from "../../components/remote-services/service-form/ServiceForm"
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"

import remoteServicesSvg from "../../assets/remote-services.svg"

const RemoteServices = () => {
  // Router params
  const { projectID } = useParams()

  const dispatch = useDispatch()
  const history = useHistory()

  // Global state
  const projects = useSelector(state => state.projects)

  useEffect(() => {
    ReactGA.pageview("/projects/remote-services");
  }, [])

  // Component state
  const [modalVisible, setModalVisible] = useState(false)
  const [serviceClicked, setServiceClicked] = useState("")

  // Derived state
  const services = getProjectConfig(projects, projectID, "modules.remoteServices.externalServices", {})
  const servicesTableData = Object.entries(services).map(([name, { url }]) => ({ name, url }))
  const noOfServices = servicesTableData.length
  const serviceClickedInfo = serviceClicked ? { name: serviceClicked, url: services[serviceClicked].url } : undefined

  // Handlers
  const handleEditClick = (name) => {
    setServiceClicked(name)
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
    setServiceClicked("")
  }

  const handleSubmit = (name, url) => {
    const serviceConfig = services[name]
    const newServiceConfig = Object.assign({}, serviceConfig ? serviceConfig : { endpoints: {} }, { url })
    const newServices = Object.assign({}, services, { [name]: newServiceConfig })
    dispatch(increment("pendingRequests"))
    client.remoteServices.setServiceConfig(projectID, name, newServiceConfig).then(() => {
      setProjectConfig(projectID, `modules.remoteServices.externalServices`, newServices)
      notify("success", "Success", `${serviceConfig ? "Modified" : "Added"} service successfully`)
    }).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleViewClick = (name) => {
    history.push(`/mission-control/projects/${projectID}/remote-services/${name}`)
  }

  const handleDelete = (name) => {
    dispatch(increment("pendingRequests"))
    client.remoteServices.deleteServiceConfig(projectID, name).then(() => {
      const newServices = Object.assign({}, services)
      delete newServices[name]
      setProjectConfig(projectID, "modules.remoteServices.externalServices", newServices)
      notify("success", "Success", "Removed service successfully")
    }).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
  }

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span style={{ display: "flex", justifyContent: "inline" }}>
          <a onClick={() => handleViewClick(name)}>View</a>
          <a onClick={(e) => {
            handleEditClick(name)
            e.stopPropagation()
          }}>Edit</a>
          <div onClick={e => e.stopPropagation()}>
            <Popconfirm title={`This will remove this service and all its endpoints from Space Cloud. Are you sure?`} onConfirm={() => {
              handleDelete(name)
            }}>
              <a style={{ color: "red" }}>Remove</a>
            </Popconfirm>
          </div>
        </span>
      )
    }
  ]

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='remote-services' />
      <div className='page-content'>
        {noOfServices === 0 && <div style={{ marginTop: 24 }}>
          <div className="panel">
            <img src={remoteServicesSvg} />
            <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Access your RESTful services via the unified GraphQL APIs of Space Cloud. <a href="https://docs.spaceuptech.com/microservices/graphql">View Docs.</a></p>
            <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setModalVisible(true)}>Add first remote service</Button>
          </div>
        </div>}
        {noOfServices > 0 && (
          <React.Fragment>
            <h3 style={{ display: "flex", justifyContent: "space-between" }}>Remote Services <Button onClick={() => setModalVisible(true)} type="primary">Add</Button></h3>
            <Table columns={tableColumns} dataSource={servicesTableData} onRow={(record) => { return { onClick: event => { handleViewClick(record.name) } } }} />
          </React.Fragment>
        )}
        {modalVisible && <ServiceForm
          initialValues={serviceClickedInfo}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
        />}
      </div>
    </React.Fragment>
  )
}

export default RemoteServices