import React, { useState } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from "react-redux"
import { notify, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from "../../utils"
import { LeftOutlined } from '@ant-design/icons';
import { Button, Table, Popconfirm, Input, Empty } from "antd";
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import endpointImg from "../../assets/structure.svg"
import { endpointTypes, securityRuleGroups, projectModules, actionQueuedMessage } from "../../constants"
import { deleteRemoteServiceEndpoint, getRemoteServiceEndpoints } from "../../operations/remoteServices"
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

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

  // Global state
  const endpoints = useSelector(state => getRemoteServiceEndpoints(state, serviceName))
  const [searchText, setSearchText] = useState('')

  // Derived state
  const endpointsTableData = Object.entries(endpoints).map(([name, { path, kind, method }]) => {
    return {
      name,
      method,
      kind,
      path: kind === endpointTypes.PREPARED ? `http://localhost:4122/v1/api/${projectID}/graphql` : path
    }
  })
  const noOfEndpoints = endpointsTableData.length

  const filteredEndpointsData = endpointsTableData.filter(endpoint => {
    return endpoint.path.toLowerCase().includes(searchText.toLowerCase()) || endpoint.name.toLowerCase().includes(searchText.toLowerCase())
  })

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
      },
      filters: [
        { text: 'Internal', value: endpointTypes.INTERNAL },
        { text: 'External', value: endpointTypes.EXTERNAL },
        { text: 'Space Cloud', value: endpointTypes.PREPARED }
      ],
      onFilter: (value, record) => record.kind.indexOf(value) === 0
    },
    {
      title: 'Method',
      render: (_, { kind, method }) => kind === endpointTypes.PREPARED ? "POST" : method,
      filters: [
        { text: 'POST', value: 'POST' },
        { text: 'PUT', value: 'PUT' },
        { text: 'GET', value: 'GET' },
        { text: 'DELETE', value: 'DELETE' }
      ],
      onFilter: (value, { method, kind }) => kind !== endpointTypes.PREPARED ? method.indexOf(value) === 0 : 'POST'.indexOf(value) === 0
    },
    {
      title: 'Path',
      render: (_, { path }) =>
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={path ? path.toString() : ''}
        />
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
                <h3 style={{ margin: 'auto 0' }}>Endpoints {filteredEndpointsData.length ? `(${filteredEndpointsData.length})` : ''}</h3>
                <div style={{ display: 'flex' }}>
                  <Input.Search placeholder='Search by endpoint name or path' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
                  <Button style={{ marginLeft: '16px' }} onClick={() => history.push(`/mission-control/projects/${projectID}/remote-services/${serviceName}/endpoints/add`)} type="primary">Add</Button>
                </div>
              </div>
              <Table
                columns={tableColumns}
                dataSource={filteredEndpointsData}
                pagination={false}
                locale={{
                  emptyText: endpointsTableData.length !== 0 ?
                    <EmptySearchResults searchText={searchText} /> :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No endpoint created yet. Add a endpoint' />
                }} />
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default RemoteService