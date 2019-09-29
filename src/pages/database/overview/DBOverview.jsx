import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { get, set, increment, decrement } from 'automate-redux';
import store from '../../../store';
import client from "../../../client"

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DbConfigure from '../../../components/database/overview/configure/DbConfigure';
import CreateNewCollectionForm from '../../../components/database/overview/collection-form/CreateNewCollectionForm';
import TablesEmptyState from "../../../components/database/tables-empty-state/TablesEmptyState"
import DBTabs from '../../../components/database/db-tabs/DbTabs';

import '../database.css';

// antd
import { Col, Row, Button, Icon, Table, Switch } from 'antd';
import { createTable, notify, fetchCollections, handleSetUpDb } from '../../../utils';

const Overview = props => {
  const [modalVisible, handleModalVisiblity] = useState(false);
  useEffect(() => {
    fetchCollections(props.projectId)
  }, [props.projectId, props.selectedDb])

  const label = props.selectedDb === 'mongo' ? 'Collection' : 'Table'

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
      render: (_, record) => (
        <Switch
          defaultChecked={record.realtime}
          onChange={checked =>
            props.onChangeRealtimeEnabled(record.name, checked)
          }
        />
      )

    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, record) => (
        <span>
          <Link to={`/mission-control/projects/${props.projectId}/database/rules/${props.selectedDb}`}
            onClick={() => props.handleSelection(record.name)}>
            Edit Rules
          </Link>
          <Link to={`/mission-control/projects/${props.projectId}/database/schema/${props.selectedDb}`}
            onClick={() => props.handleSelection(record.name)}>
            Edit Schema
          </Link>
        </span>
      ),
    },
  ];

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
      render: (_, record) => (
        <span>
          <a onClick={() => props.handleTrackTables([record.name])}>Track</a>
        </span>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
        selectedDb={props.selectedDb}
      />
      <div className='flex-box'>
        <Sidenav selectedItem='database' />
        <div className='db-page-content'>
          <DBTabs
            selectedDatabase={props.match.params.database}
            activeKey='overview'
            projectId={props.match.params.projectId}
          />
          <div className="db-tab-content">
            <div>
              <DbConfigure
                updateFormState={props.updateFormState}
                formState={props.formState}
                setUpDb={props.setUpDb}
                dbType={props.selectedDb}
                handleSetUpDb={() => handleSetUpDb(props.projectId)}
              />
            </div>
            {props.trackedTables.length > 0 && (
              <div>
                <div style={{ marginTop: '32px' }}>
                  <span className='collections'>
                    {label}s
                    </span>
                  <Button style={{ float: "right" }} type="primary" className="secondary-action" ghost
                    onClick={() => handleModalVisiblity(true)}>
                    <Icon type='plus' /> Add {label}
                  </Button>
                </div>
                <div style={{ marginTop: '32px' }}>
                  <Table columns={trackedTableColumns} dataSource={props.trackedTables} />
                </div>
              </div>
            )}

            {props.trackedTables.length === 0 && (
              <TablesEmptyState dbType={props.selectedDb} projectId={props.projectId} handleAdd={() => handleModalVisiblity(true)} />
            )}

            {props.untrackedTables.length > 0 && (
              <Row>
                <Col span={12}>
                  <div style={{ marginTop: '32px' }}>
                    <span className='collections'>
                      Untracked {label}s
                    </span>
                    <Button
                     style={{ float: "right" }} type="primary" className="secondary-action" ghost
                     onClick={() => props.handleTrackTables(props.untrackedTables.map(o => o.name))}>
                      <Icon type='plus' /> Track All
                    </Button>
                  </div>
                  <div style={{ marginTop: '32px' }}>
                    <Table columns={untrackedTableColumns} dataSource={props.untrackedTables} pagination={false} />
                  </div>
                </Col>
              </Row>
            )}
            {modalVisible && <CreateNewCollectionForm
              selectedDb={props.selectedDb}
              visible={modalVisible}
              handleCancel={() => handleModalVisiblity(false)}
              handleSubmit={(collectionName, rules, schema, realtimeEnabled) => {
                createTable(props.projectId, props.selectedDb, collectionName, rules, schema, realtimeEnabled)
              }}
            />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => {
  const projectId = ownProps.match.params.projectId;
  const selectedDb = ownProps.match.params.database;
  const trackedTables = get(state, `config.modules.crud.${selectedDb}.collections`, {})
  const tables = get(state, `tables.${projectId}.${selectedDb}`, [])
  return {
    selectedDb: ownProps.match.params.database,
    projectId: projectId,
    formState: {
      enabled: get(
        state,
        `config.modules.crud.${ownProps.match.params.database}.enabled`,
        false
      ),
      conn: get(
        state,
        `config.modules.crud.${ownProps.match.params.database}.conn`
      )
    },
    rules: get(
      state,
      `config.modules.crud.${ownProps.match.params.database}.collections`,
      {}
    ),
    selectedCollection: get(
      state,
      `uiState.database.${selectedDb}.selectedCollection`,
      'default'
    ),
    trackedTables: Object.entries(trackedTables).map(([name, val]) => Object.assign({}, {
      name: name,
      realtime: val.isRealtimeEnabled,
    })).filter(obj => obj.name !== "default" && obj.name !== "events_log"),
    setUpDb: tables.includes("events_log") ? true: false, 
    untrackedTables: tables.filter(table => !trackedTables[table]).map(name => ({ name: name })),
    createTableModalVisible: get(state, 'uiState.database.createTableModalVisible', false)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const projectId = ownProps.match.params.projectId;
  const selectedDb = ownProps.match.params.database;
  return {
    onChangeRealtimeEnabled: (name, checked) => {
      dispatch(
        set(
          `config.modules.crud.${selectedDb}.collections.${name}.isRealtimeEnabled`,
          checked
        )
      );
    },
    updateFormState: fields => {
      const dbConfig = get(
        store.getState(),
        `config.modules.crud.${selectedDb}`,
        {}
      );
      dispatch(
        set(
          `config.modules.crud.${selectedDb}`,
          Object.assign({}, dbConfig, fields)
        )
      );
    },
    handleSelection: collectionName => {
      dispatch(set(`uiState.database.${selectedDb}.selectedCollection`, collectionName));
    },
    handleTrackTables: (tables) => {
      const collections = get(store.getState(), `config.modules.crud.${selectedDb}.collections`, {})
      const defaultCollection = collections.default
      const defaultRule = defaultCollection ? defaultCollection.rules : ''
      if (selectedDb === "mongo") {
        let newCollections = Object.assign({}, collections)
        tables.forEach((table) => {
          const schema = `type ${table} {\n  _id: ID! @id \n}`
          newCollections[table] = {
            isRealtimeEnabled: true,
            rules: defaultRule,
            schema: schema
          }
        })
        dispatch(set(`config.modules.crud.${selectedDb}.collections`, newCollections))
        return
      }
      dispatch(increment("pendingRequests"))
      Promise.all(tables.map(table => client.handleInspect(projectId, selectedDb, table)))
        .then((schemas) => {
          let newCollections = Object.assign({}, collections)
          tables.forEach((table, index) => {
            newCollections[table] = {
              isRealtimeEnabled: true,
              rules: defaultRule,
              schema: schemas[index]
            }
          })

          dispatch(set(`config.modules.crud.${selectedDb}.collections`, newCollections))
        })
        .catch(error => {
          console.log("Error", error)
          notify("error", "Error", 'Could not track table')
        })
        .finally(() => dispatch(decrement("pendingRequests")))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
