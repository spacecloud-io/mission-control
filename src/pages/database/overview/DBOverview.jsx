import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { get } from 'automate-redux';

import { Col, Row, Button, Icon, Table, Switch, Descriptions, Badge, Popconfirm } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import AddCollectionForm from '../../../components/database/add-collection-form/AddCollectionForm';
import EditConnectionForm from '../../../components/database/edit-connection-form/EditConnectionForm';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import disconnectedImg from '../../../assets/disconnected.jpg';

import { notify, getProjectConfig, parseDbConnString } from '../../../utils';
import { setDBConfig, setColConfig, deleteCol, setColRule, inspectColSchema, fetchDBConnState } from '../dbActions';


const Overview = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const projects = useSelector(state => state.projects)
  const allCollections = useSelector(state => get(state, `extraConfig.${projectID}.crud.${selectedDB}.collections`, []))
  const connected = useSelector(state => get(state, `extraConfig.${projectID}.crud.${selectedDB}.connected`))

  // Component state
  const [addColModalVisible, setAddColModalVisible] = useState(false);
  const [addColFormInEditMode, setAddColFormInEditMode] = useState(false);
  const [editConnModalVisible, setEditConnModalVisible] = useState(false);
  const [clickedCol, setClickedCol] = useState("");

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {})
  const connString = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.conn`)
  const { hostName, port } = parseDbConnString(connString);
  const unTrackedCollections = allCollections.filter(col => !collections[col])
  const unTrackedCollectionsToShow = unTrackedCollections.map(col => ({ name: col }))
  const trackedCollections = Object.entries(collections).map(([name, val]) => Object.assign({}, { name: name, realtime: val.isRealtimeEnabled }))
  const trackedCollectionsToShow = trackedCollections.filter(obj => obj.name !== "default" && obj.name !== "event_logs")
  const clickedColDetails = clickedCol ? Object.assign({}, collections[clickedCol], { name: clickedCol }) : null


  useEffect(() => {
    fetchDBConnState(projectID, selectedDB)
  }, [projectID, selectedDB])

  // Handlers
  const handleRealtimeEnabled = (colName, isRealtimeEnabled) => {
    const rules = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.${colName}.rules`)
    setColRule(projectID, selectedDB, colName, rules, isRealtimeEnabled)
  }

  const handleAddClick = () => {
    setAddColFormInEditMode(false)
    setAddColModalVisible(true)
  }

  const handleEditClick = (colName) => {
    setClickedCol(colName)
    setAddColFormInEditMode(true)
    setAddColModalVisible(true)
  }

  const handleDelete = (colName) => {
    deleteCol(projectID, selectedDB, colName).then(() => notify("success", "Success", `Deleted ${colName} successfully`))
  }

  const handleTrackCollections = (collections) => {
    Promise.all(collections.map(colName => inspectColSchema(projectID, selectedDB, colName)))
      .then(() => notify("success", "Success", `Tracked ${collections.length > 1 ? "collections" : "collection"} successfully`))
      .catch(ex => notify("error", "Error", ex))
  }

  const handleAddCollection = (editMode, colName, rules, schema, isRealtimeEnabled) => {
    setColConfig(projectID, selectedDB, colName, rules, schema, isRealtimeEnabled).then(() => {
      notify("success", "Success", `${editMode ? "Modified" : "Added"} ${colName} successfully`)
    }).catch(ex => notify("error", "Error", ex))
  }

  const handleEditConnString = (conn) => {
    setDBConfig(projectID, selectedDB, true, conn).catch(ex => notify("error", "Error", ex))
  }

  const label = selectedDB === 'mongo' ? 'Collection' : 'Table'
  const trackedTableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Realtime',
      dataIndex: 'realtime',
      key: 'realtime',
      render: (_, { name, realtime }) => (
        <Switch
          defaultChecked={realtime}
          onChange={checked =>
            handleRealtimeEnabled(name, checked)
          }
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span>
          <a onClick={() => handleEditClick(name)}>Edit</a>
          <Popconfirm title={`This will delete all the data from ${name}. Are you sure?`} onConfirm={() => handleDelete(name)}>
            <a>Delete</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  const untrackedTableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Action',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span>
          <a onClick={() => handleTrackCollections([name])}>Track</a>
        </span>
      )
    }
  ]

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <DBTabs activeKey='overview' projectID={projectID} selectedDB={selectedDB} />
          <div className="db-tab-content">
            <h3>Connection Details <a style={{ textDecoration: "underline", fontSize: 14 }} onClick={() => setEditConnModalVisible(true)}>(Edit)</a></h3>
            <Descriptions bordered>
              <Descriptions.Item label="Host">{hostName}</Descriptions.Item>
              <Descriptions.Item label="Port">{port}</Descriptions.Item>
              <Descriptions.Item label="Status" >
                <Badge status="processing" text="Running" color={connected ? "green" : "red"} text={connected ? "connected" : "disconnected"} />
              </Descriptions.Item>
            </Descriptions>
            {!connected && <div className="empty-state">
              <div className="empty-state__graphic">
                <img src={disconnectedImg} alt="" />
              </div>
              <p className="empty-state__description">Oops... Space Cloud could not connect to your database</p>
              <p className="empty-state__action-text">Enter the correct connection details of your database</p>
              <div className="empty-state__action-bar">
                <Button className="action-rounded" type="default" onClick={() => handleEditConnString(connString)}>Reconnect</Button>
                <Button className="action-rounded" type="primary" style={{ marginLeft: 24 }} onClick={() => setEditConnModalVisible(true)}>Edit Connection</Button>
              </div>
            </div>}
            {connected && <React.Fragment>
              {trackedCollectionsToShow.length === 0 && <div className="empty-state">
                <div className="empty-state__graphic">
                  <i className="material-icons-outlined" style={{ fontSize: 120, color: "#52C41A" }}>check_circle</i>
                </div>
                <p className="empty-state__description">Your database is set up!</p>
                <p className="empty-state__action-text">Add a table for easy schema and access management</p>
                <div className="empty-state__action-bar">
                  <Button className="action-rounded" type="primary" onClick={handleAddClick}>Add table</Button>
                </div>
              </div>}
              {trackedCollectionsToShow.length > 0 && (
              <div>
                <div style={{ marginTop: '32px' }}>
                  <span className='collections'>
                    {label}s
                    </span>
                  <Button style={{ float: "right" }} type="primary" className="secondary-action" ghost
                    onClick={handleAddClick}>
                    <Icon type='plus' /> Add {label}
                  </Button>
                </div>
                <div style={{ marginTop: '32px' }}>
                  <Table columns={trackedTableColumns} dataSource={trackedCollectionsToShow} />
                </div>
              </div>
            )}
            {unTrackedCollectionsToShow.length > 0 && (
              <Row>
                <Col span={12}>
                  <div style={{ marginTop: '32px' }}>
                    <span className='collections'>
                      Untracked {label}s
                    </span>
                    <Button
                      style={{ float: "right" }} type="primary" className="secondary-action" ghost
                      onClick={() => handleTrackCollections(unTrackedCollections)}>
                      <Icon type='plus' /> Track All
                    </Button>
                  </div>
                  <div style={{ marginTop: '32px' }}>
                    <Table columns={untrackedTableColumns} dataSource={unTrackedCollectionsToShow} pagination={false} />
                  </div>
                </Col>
              </Row>
            )}
            </React.Fragment>}
            {addColModalVisible && <AddCollectionForm
              editMode={addColFormInEditMode}
              initialValues={clickedColDetails}
              selectedDB={selectedDB}
              handleCancel={() => setAddColModalVisible(false)}
              handleSubmit={(...params) => handleAddCollection(addColFormInEditMode, ...params)}
            />}
            {editConnModalVisible && <EditConnectionForm
              initialValues={{ conn: connString }}
              selectedDB={selectedDB}
              handleCancel={() => setEditConnModalVisible(false)}
              handleSubmit={handleEditConnString} />}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Overview