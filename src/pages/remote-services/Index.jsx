import React, { useState } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from "react-redux"
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../utils"

import { Button, Table, Popconfirm, Input, Empty } from "antd"
import ServiceForm from "../../components/remote-services/service-form/ServiceForm"
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import { saveRemoteService, deleteRemoteService, getRemoteServices } from "../../operations/remoteServices"

import remoteServicesSvg from "../../assets/remote-services.svg"
import { projectModules, actionQueuedMessage } from "../../constants";
import Highlighter from "react-highlight-words";
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

const RemoteServices = () => {
  // Router params
  const { projectID } = useParams()
  const history = useHistory()

  // Global state
  const services = useSelector(state => getRemoteServices(state))

  // Component state
  const [modalVisible, setModalVisible] = useState(false)
  const [serviceClicked, setServiceClicked] = useState("")
  const [searchText, setSearchText] = useState('')

  // Derived state
  const servicesTableData = Object.entries(services).map(([name, { url }]) => ({ name, url }))
  const noOfServices = servicesTableData.length
  const serviceClickedInfo = serviceClicked ? { name: serviceClicked, url: services[serviceClicked].url } : undefined

  const filteredServicesData = servicesTableData.filter(service => {
    return service.name.toLowerCase().includes(searchText.toLowerCase());
  })

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
    return new Promise((resolve, reject) => {
      const serviceConfig = services[name]
      const newServiceConfig = Object.assign({}, serviceConfig ? serviceConfig : { endpoints: {} }, { url })
      incrementPendingRequests()
      saveRemoteService(projectID, name, newServiceConfig)
        .then(({ queued }) => {
          if (!serviceConfig) {
            history.push(`/mission-control/projects/${projectID}/remote-services/${name}`)
          }
          notify("success", "Success", queued ? actionQueuedMessage : `${serviceConfig ? "Modified" : "Added"} remote service successfully`)
          resolve()
        })
        .catch((ex) => {
          notify("error", `Error ${serviceConfig ? "modifying" : "adding"} remote service`, ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  const handleViewClick = (name) => {
    history.push(`/mission-control/projects/${projectID}/remote-services/${name}`)
  }

  const handleDelete = (name) => {
    incrementPendingRequests()
    deleteRemoteService(projectID, name)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Removed remote service successfully"))
      .catch(ex => notify("error", "Error removing remote service", ex))
      .finally(() => decrementPendingRequests())
  }

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value) => {
        return <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      }
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
      <Sidenav selectedItem={projectModules.REMOTE_SERVICES} />
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
              <h3 style={{ margin: 'auto 0' }}>Remote Services {filteredServicesData.length ? `(${filteredServicesData.length})` : ''}</h3>
              <div style={{ display: 'flex' }}>
                <Input.Search placeholder='Search by remote service name' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
                <Button style={{ marginLeft: '16px' }} onClick={() => setModalVisible(true)} type="primary">Add</Button>
              </div>
            </div>
            <Table
              columns={tableColumns}
              dataSource={filteredServicesData}
              onRow={(record) => { return { onClick: event => { handleViewClick(record.name) } } }}
              locale={{
                emptyText: servicesTableData.length !== 0 ?
                  <EmptySearchResults searchText={searchText} /> :
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No remote service created yet. Add a remote service' />
              }} />
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