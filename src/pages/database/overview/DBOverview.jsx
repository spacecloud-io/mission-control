import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get, set } from 'automate-redux';
import ReactGA from 'react-ga';

import { PlusOutlined } from '@ant-design/icons';

import { Col, Row, Button, Table, Switch, Descriptions, Badge, Popconfirm, Typography } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import AddCollectionForm from '../../../components/database/add-collection-form/AddCollectionForm';
import EditConnectionForm from '../../../components/database/edit-connection-form/EditConnectionForm';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import disconnectedImg from '../../../assets/disconnected.jpg';

import { notify, getProjectConfig, parseDbConnString, getDBTypeFromAlias } from '../../../utils';
import history from '../../../history';
import { setDBConfig, setColConfig, deleteCol, setColRule, inspectColSchema, fetchDBConnState } from '../dbActions';
import { defaultDBRules } from '../../../constants';


const Overview = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // changes
  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects)
  const allCollections = useSelector(state => get(state, `extraConfig.${projectID}.db.${selectedDB}.collections`, []))
  const connected = useSelector(state => get(state, `extraConfig.${projectID}.db.${selectedDB}.connected`))

  // Component state
  const [addColModalVisible, setAddColModalVisible] = useState(false);
  const [addColFormInEditMode, setAddColFormInEditMode] = useState(false);
  const [editConnModalVisible, setEditConnModalVisible] = useState(false);
  // making changes for loading button
  const [conformLoading, setConformLoading] = useState(false);
  const [clickedCol, setClickedCol] = useState("");

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.collections`, {})
  const connString = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.conn`, "")
  let defaultRules = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.collections.default.rules`, {})
  if (Object.keys(defaultRules).length === 0) {
    defaultRules = defaultDBRules
  }
  const { hostName, port } = parseDbConnString(connString);
  const hostString = connString.includes("secrets.") ? connString : (hostName ? `${hostName}:${port}` : "")
  const unTrackedCollections = allCollections.filter(col => !collections[col] && col !== "event_logs" && col !== "invocation_logs")
  const unTrackedCollectionsToShow = unTrackedCollections.map(col => ({ name: col }))
  const trackedCollections = Object.entries(collections).map(([name, val]) => Object.assign({}, { name: name, realtime: val.isRealtimeEnabled }))
  const trackedCollectionsToShow = trackedCollections.filter(obj => obj.name !== "default" && obj.name !== "event_logs" && obj.name !== "invocation_logs")
  const clickedColDetails = clickedCol ? Object.assign({}, collections[clickedCol], { name: clickedCol }) : null

  useEffect(() => {
    ReactGA.pageview("/projects/database/overview");
    fetchDBConnState(projectID, selectedDB)
  }, [projectID, selectedDB])

  // Handlers
  const handleRealtimeEnabled = (colName, isRealtimeEnabled) => {
    const rules = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.collections.${colName}.rules`)
    setColRule(projectID, selectedDB, colName, rules, isRealtimeEnabled, true)
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

  const handleCancelAddColModal = () => {
    setAddColModalVisible(false)
    setAddColFormInEditMode(false)
    setClickedCol("")
  }

  const handleDelete = (colName) => {
    deleteCol(projectID, selectedDB, colName).then(() => notify("success", "Success", `Deleted ${colName} successfully`))
      .catch(ex => notify("error", "Error", ex))
    if (clickedCol === colName) {
      setClickedCol("")
    }
  }

  const handleViewQueriesClick = (colName) => {
    dispatch(set("uiState.selectedCollection", colName))
    history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/queries`);
  }

  const handleTrackCollections = (collections) => {
    Promise.all(collections.map(colName => inspectColSchema(projectID, selectedDB, colName)))
      .then(() => notify("success", "Success", `Tracked ${collections.length > 1 ? "collections" : "collection"} successfully`))
      .catch(ex => notify("error", "Error", ex))
  }

  const handleAddCollection = (editMode, colName, rules, schema, isRealtimeEnabled) => {
    setConformLoading(true);
    setColConfig(projectID, selectedDB, colName, rules, schema, isRealtimeEnabled).then(() => {
      notify("success", "Success", `${editMode ? "Modified" : "Added"} ${colName} successfully`)
      setAddColModalVisible(false);
      setAddColFormInEditMode(false);
      setConformLoading(false);
      dispatch(set("uiState.selectedCollection", colName))
    }).catch(ex => {
      notify("error", "Error", ex)
      setConformLoading(false);
    })
  }

  const handleEditConnString = (conn) => {
    setConformLoading(true);
    const dbType = getDBTypeFromAlias(projectID, selectedDB)
    let dbName = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.dbName`)
    setDBConfig(projectID, selectedDB, true, conn, dbType, dbName, false)
      .then(() => {
        notify("success", "Connection successful", `Connected to ${dbType} successfully`)
        setEditConnModalVisible(false);
      })
      .catch(() => notify("error", "Connection failed", ` Unable to connect to ${dbType}. Make sure your connection string is correct.`))
      .finally(() => setConformLoading(false))
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
          checked={realtime}
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
          <a onClick={() => handleViewQueriesClick(name)}>View Sample Queries</a>
          <Popconfirm title={`This will delete all the data from ${name}. Are you sure?`} onConfirm={() => handleDelete(name)}>
            <a style={{ color: "red" }}>Delete</a>
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
            <Descriptions bordered size="small">
              <Descriptions.Item label="Host">
                <Typography.Paragraph
                  style={{ marginBottom: 0 }}
                  copyable={hostString ? { text: hostString } : false}
                  ellipsis>
                  {connString.includes("secrets.") ? "********************" : hostString}
                </Typography.Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                <Badge status="processing" text="Running" color={connected ? "green" : "red"} text={connected ? "connected" : "disconnected"} />
              </Descriptions.Item>
            </Descriptions>
            {!connected && <div className="empty-state overview-img">
              <div className="empty-state__graphic">
                <img src={disconnectedImg} alt="" />
              </div>
              <p className="empty-state__description">Oops... Space Cloud could not connect to your database</p>
              <p className="empty-state__action-text">Enter the correct connection details of your database</p>
              <div className="empty-state__action-bar">
                <Button className="action-rounded reconnect" type="default" onClick={() => handleEditConnString(connString)}>Reconnect</Button>
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
                      <PlusOutlined /> Add {label}
                    </Button>
                  </div>
                  <div style={{ marginTop: '32px' }}>
                    <Table columns={trackedTableColumns} dataSource={trackedCollectionsToShow} />
                  </div>
                </div>
              )}
              {unTrackedCollectionsToShow.length > 0 && (
                <Row>
                  <Col xl={{ span: 8 }} lg={{ span: 12 }} xs={{ span: 24 }}>
                    <div style={{ marginTop: '32px' }}>
                      <span className='collections'>
                        Untracked {label}s
                    </span>
                      <Button
                        style={{ float: "right" }} type="primary" className="secondary-action" ghost
                        onClick={() => handleTrackCollections(unTrackedCollections)}>
                        <PlusOutlined /> Track All
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
              projectId={projectID}
              selectedDB={selectedDB}
              conformLoading={conformLoading}
              defaultRules={defaultRules}
              handleCancel={() => handleCancelAddColModal(false)}
              handleSubmit={(...params) => handleAddCollection(addColFormInEditMode, ...params)}
            />}
            {editConnModalVisible && <EditConnectionForm
              initialValues={{ conn: connString }}
              conformLoading={conformLoading}
              handleCancel={() => setEditConnModalVisible(false)}
              handleSubmit={handleEditConnString} />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Overview