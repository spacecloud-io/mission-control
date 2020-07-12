import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { set } from 'automate-redux';
import ReactGA from 'react-ga';

import { Col, Row, Button, Table, Switch, Descriptions, Badge, Popconfirm, Typography, Empty } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import AddCollectionForm from '../../../components/database/add-collection-form/AddCollectionForm';
import EditConnectionForm from '../../../components/database/edit-connection-form/EditConnectionForm';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import disconnectedImg from '../../../assets/disconnected.jpg';

import { notify, parseDbConnString, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../../utils';
import history from '../../../history';
import { saveColSchema, inspectColSchema, untrackCollection, deleteCollection, loadDBConnState, enableDb, saveColRealtimeEnabled, getDbType, getDbConnState, getDbConnectionString, getTrackedCollectionsInfo, getUntrackedCollections, loadCollections } from "../../../operations/database"
import { dbTypes, securityRuleGroups } from '../../../constants';


const Overview = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const dispatch = useDispatch();

  // Global state
  const connected = useSelector(state => getDbConnState(state, selectedDB))
  const selectedDBType = useSelector(state => getDbType(state, selectedDB))
  const connString = useSelector(state => getDbConnectionString(state, selectedDB))
  const unTrackedCollections = useSelector(state => getUntrackedCollections(state, selectedDB))
  const unTrackedCollectionsInfo = unTrackedCollections.map(colName => ({ name: colName }))
  const trackedCollections = useSelector(state => getTrackedCollectionsInfo(state, selectedDB))

  // Component state
  const [addColModalVisible, setAddColModalVisible] = useState(false);
  const [addColFormInEditMode, setAddColFormInEditMode] = useState(false);
  const [editConnModalVisible, setEditConnModalVisible] = useState(false);
  const [clickedCol, setClickedCol] = useState("");

  // Derived state
  const { hostName, port } = parseDbConnString(connString);
  const hostString = connString.includes("secrets.") ? connString : (hostName ? `${hostName}:${port}` : "")
  const clickedColDetails = trackedCollections.find(obj => obj.name === clickedCol)

  useEffect(() => {
    ReactGA.pageview("/projects/database/overview");
  }, [])

  useEffect(() => {
    if (projectID && selectedDB) {
      incrementPendingRequests()
      loadDBConnState(projectID, selectedDB)
        .catch(ex => notify("error", "Error fetching database connection state", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID, selectedDB])

  // Handlers
  const handleRealtimeEnabled = (colName, isRealtimeEnabled) => {
    incrementPendingRequests()
    saveColRealtimeEnabled(projectID, selectedDB, colName, isRealtimeEnabled)
      .then(() => notify("success", "Success", `Successfully ${isRealtimeEnabled ? "enabled" : "disabled"} realtime functionality`))
      .catch(ex => notify("error", `Successfully ${isRealtimeEnabled ? "enabled" : "disabled"} realtime functionality`, ex))
      .finally(() => decrementPendingRequests())
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

  const handleBrowseClick = (colName) => {
    dispatch(set("uiState.selectedCollection", colName));
    history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/browse`)
  }

  const handleSecureClick = (colName) => openSecurityRulesPage(projectID, securityRuleGroups.DB_COLLECTIONS, colName, selectedDB)

  const handleCancelAddColModal = () => {
    setAddColModalVisible(false)
    setAddColFormInEditMode(false)
    setClickedCol("")
  }

  const handleDelete = (colName) => {
    incrementPendingRequests()
    deleteCollection(projectID, selectedDB, colName)
      .then(() => {
        notify("success", "Success", `Deleted ${colName} successfully`)
        if (clickedCol === colName) {
          setClickedCol("")
        }
      })
      .catch(ex => notify("error", "Error deleting table", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleViewQueriesClick = (colName) => {
    dispatch(set("uiState.selectedCollection", colName))
    history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/queries`);
  }

  const handleUntrackClick = (colName) => {
    untrackCollection(projectID, selectedDB, colName)
      .then(() => notify("success", "Success", `Sucessfully untracked ${colName} collection`))
      .catch(ex => notify("error", `Error untracking ${colName} collection`, ex))
  }

  const handleTrackCollections = (collections) => {
    incrementPendingRequests()
    Promise.all(collections.map(colName => inspectColSchema(projectID, selectedDB, colName)))
      .then(() => notify("success", "Success", `Tracked ${collections.length > 1 ? "collections" : "collection"} successfully`))
      .catch(ex => notify("error", `Error tracking ${collections.length > 1 ? "collections" : "collection"}`, ex))
      .finally(() => decrementPendingRequests())
  }

  const handleAddCollection = (editMode, colName, schema) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveColSchema(projectID, selectedDB, colName, schema)
        .then(() => {
          notify("success", "Success", `${editMode ? "Modified" : "Added"} ${colName} successfully`)
          dispatch(set("uiState.selectedCollection", colName))
          resolve()
        })
        .catch(ex => {
          notify("error", `Error ${editMode ? "Modified" : "Added"} ${colName}`, ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  const handleEditConnString = (conn) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      enableDb(projectID, selectedDB, conn)
        .then(connected => {
          if (connected) {
            notify("success", "Connection successful", `Connected to database successfully`)
            resolve()
            return
          }
          notify("error", "Connection failed", ` Unable to connect to database. Make sure your connection string is correct.`)
          reject()
        })
        .catch(() => {
          notify("error", "Connection failed", ` Unable to connect to database. Make sure your connection string is correct.`)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }
  const label = selectedDBType === dbTypes.MONGO || selectedDBType === dbTypes.EMBEDDED ? 'collection' : 'table'
  const trackedTableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Realtime',
      dataIndex: 'isRealtimeEnabled',
      key: 'realtime',
      render: (_, { name, isRealtimeEnabled }) => (
        <Switch
          checked={isRealtimeEnabled}
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
          <a onClick={() => handleSecureClick(name)}>Secure</a>
          <a onClick={() => handleBrowseClick(name)}>Browse</a>
          <a onClick={() => handleViewQueriesClick(name)}>View Sample Queries</a>
          <a onClick={() => handleUntrackClick(name)}>Untrack</a>
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
          <Popconfirm title={`This will delete all the data from ${name}. Are you sure?`} onConfirm={() => handleDelete(name)}>
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
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
              <div>
                <div style={{ marginTop: '32px' }}>
                  <span className='collections'>
                    Tracked {label}s
                    </span>
                  <Button style={{ float: "right" }} type="primary"
                    onClick={handleAddClick}>
                    Add {label}
                  </Button>
                </div>
                <div style={{ marginTop: '32px' }}>
                  <Table columns={trackedTableColumns} dataSource={trackedCollections} bordered locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No tracked tables. Add a table' /> }} />
                </div>
              </div>
              {unTrackedCollections.length > 0 && (
                <Row>
                  <Col xl={{ span: 8 }} lg={{ span: 12 }} xs={{ span: 24 }}>
                    <div style={{ marginTop: '32px' }}>
                      <span className='collections'>
                        Untracked {label}s
                    </span>
                      <Button
                        style={{ float: "right" }} type="primary" ghost
                        onClick={() => handleTrackCollections(unTrackedCollections)}>
                        Track All
                    </Button>
                    </div>
                    <div style={{ marginTop: '32px' }}>
                      <Table columns={untrackedTableColumns} dataSource={unTrackedCollectionsInfo} pagination={false} bordered />
                    </div>
                  </Col>
                </Row>
              )}
            </React.Fragment>}
            {addColModalVisible && <AddCollectionForm
              editMode={addColFormInEditMode}
              initialValues={clickedColDetails}
              dbType={selectedDBType}
              handleCancel={handleCancelAddColModal}
              handleSubmit={(colName, schema) => handleAddCollection(addColFormInEditMode, colName, schema)}
            />}
            {editConnModalVisible && <EditConnectionForm
              initialValues={{ conn: connString }}
              handleCancel={() => setEditConnModalVisible(false)}
              handleSubmit={handleEditConnString} />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Overview