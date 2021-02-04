import { Button, Input, Popconfirm, Table, Tag, Empty } from "antd";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { projectModules, actionQueuedMessage } from "../../constants";
import Highlighter from "react-highlight-words";
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";
import { decrementPendingRequests, incrementPendingRequests, notify } from "../../utils";
import { deleteSecurityFunction, getSecurityFunctions, loadSecurityFunctions, saveSecurityFunction } from "../../operations/securityFunctions";
import { useSelector } from "react-redux";
import FunctionForm from "../../components/security-functions/function-form/FunctionForm";

const SecurityFunctions = () => {
  // Router params
  const { projectID } = useParams();

  // Global state
  const securityFunctions = useSelector(state => getSecurityFunctions(state))

  // Component state
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFunctionConfig, setSelectedFunctionConfig] = useState()

  // Derived state
  const filteredSecurityFunctions = securityFunctions.length !== 0 ? securityFunctions.filter(item => {
    return item.id.toLowerCase().includes(searchText.toLowerCase());
  }) : []

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecurityFunctions(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get security functions" : error.msg))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  // Handlers
  const handleViewClick = (name) => {
    console.log(name)
  }

  const handleEditClick = (config) => {
    setSelectedFunctionConfig(config)
    setModalVisible(true)
  }

  const handleDelete = (functionId) => {
    incrementPendingRequests()
    deleteSecurityFunction(projectID, functionId)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Removed security function successfully"))
      .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to delete security function" : error.msg))
      .finally(() => decrementPendingRequests())
  }

  const handleSubmit = (values) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveSecurityFunction(projectID, values)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : `Added security function successfully`)
          resolve()
        })
        .catch(error => {
          notify("error", error.title, error.msg.length === 0 ? "Failed to set security function" : error.msg)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
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
      title: "Variables",
      dataIndex: 'variables',
      key: "variables",
      render: (value) => value.map(item => <Tag>{item}</Tag>)
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, record) => (
        <span style={{ display: "flex", justifyContent: "inline" }}>
          <a onClick={() => handleViewClick(record.id)}>View</a>
          <a onClick={(e) => {
            handleEditClick(record)
            e.stopPropagation()
          }}>Edit</a>
          <div onClick={e => e.stopPropagation()}>
            <Popconfirm title={`Are you sure delete this function?`} onConfirm={() => {
              handleDelete(record.id)
            }}>
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </div>
        </span>
      )
    }
  ]

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SECURITY_FUNCTIONS} />
      <div className="page-content page-content--no-padding">
        <div style={{ padding: "32px 32px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
            <h3 style={{ flexGrow: 1 }}>Global security function</h3>
            <div style={{ display: "flex" }}>
              <Input.Search placeholder='Search by function name' style={{ minWidth: '320px', marginRight: 16 }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button type="primary" onClick={() => setModalVisible(true)}>Add</Button>
            </div>
          </div>
          <Table
            columns={tableColumns}
            dataSource={filteredSecurityFunctions}
            onRow={(record) => { return { onClick: event => { handleViewClick(record.name) } } }}
            locale={{
              emptyText: securityFunctions.length !== 0 ?
                <EmptySearchResults searchText={searchText} /> :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No function created yet. Add a function' />
            }}
          />
        </div>
      </div>
      {modalVisible && (
        <FunctionForm
          initialValues={selectedFunctionConfig}
          handleSubmit={handleSubmit}
          handleCancel={() => setModalVisible(false)}
        />
      )}
    </React.Fragment>
  );
};

export default SecurityFunctions;
