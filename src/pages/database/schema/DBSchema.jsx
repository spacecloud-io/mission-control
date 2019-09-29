import React, { useState } from 'react';

import { get, set, increment, decrement } from 'automate-redux';
import store from "../../../store"
import client from '../../../client';
import { connect } from 'react-redux';
import { notify, createTable } from '../../../utils';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import Documentation from "../../../components/documentation/Documentation"
import TablesEmptyState from "../../../components/database/tables-empty-state/TablesEmptyState"
import CreateNewCollectionForm from '../../../components/database/overview/collection-form/CreateNewCollectionForm';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

import '../database.css';

// antd
import { Button, Icon, Col, Row } from 'antd';

const Schema = ({
  projectId, selectedDb, collections, selectedCollection, selectedSchema,
  handleSchemaChange, handleSelection, handleReloadSchema
}) => {
  const [modalVisible, handleModalVisiblity] = useState(false);

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
        selectedDb={selectedDb}
      />
      <div className='flex-box'>
        <Sidenav selectedItem='database' />
        <div className='db-page-content'>
          <DBTabs
            selectedDatabase={selectedDb}
            activeKey='schema'
            projectId={projectId}
          />
          <div className="db-tab-content">
            {collections.length > 0 && (
              <div className='rules-schema-table'>
                <div>
                  {
                    selectedDb !== "mongo" &&
                    <Button onClick={handleReloadSchema} type="primary" className="secondary-action" ghost>
                      Reload Schema
                    </Button>
                  }
                  <span style={{ float: "right" }}>
                    <Documentation url="https://docs.spaceuptech.com" />
                  </span>
                </div>
                <div className='rules-main-wrapper'>
                  <Row>
                    <div className="rules-header">
                      <Icon type="star" />
                      <span style={{ marginLeft: '16px' }}>Any schema changes will change the underlying structure of your tables after saving config</span>
                    </div>
                    <Col span={6}>
                      <div className='rulesTable'>
                        {collections.map((collection, index) => {
                          return (
                            <div
                              className={
                                collection === selectedCollection
                                  ? 'tabledata activedata'
                                  : 'tabledata'
                              }
                              id='rule'
                              value={collection}
                              key={collection}
                              onClick={() => {
                                handleSelection(collection);
                              }}
                            >
                              <div className='add-a-rule'>{collection}</div>
                            </div>
                          );
                        })}
                      </div>
                    </Col>
                    <Col span={18}>
                      <div className='code'>
                        <div className='code-mirror'>
                          <CodeMirror
                            value={
                              selectedSchema
                            }
                            options={{
                              mode: { name: 'javascript', json: true },
                              lineNumbers: true,
                              styleActiveLine: true,
                              matchBrackets: true,
                              autoCloseBrackets: true,
                              tabSize: 2,
                              autofocus: true
                            }}
                            onBeforeChange={(editor, data, value) => {
                              handleSchemaChange(
                                selectedCollection,
                                value
                              );
                            }}
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}
            {!collections.length && (
              <TablesEmptyState dbType={selectedDb} projectId={projectId} handleAdd={() => handleModalVisiblity(true)} />
            )}
            {modalVisible && <CreateNewCollectionForm
              selectedDb={selectedDb}
              visible={modalVisible}
              handleCancel={() => handleModalVisiblity(false)}
              handleSubmit={(collectionName, rules, schema, realtimeEnabled) => {
                createTable(projectId, selectedDb, collectionName, rules, schema, realtimeEnabled)
              }}
            />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => {
  const selectedDb = ownProps.match.params.database;
  const collections = get(state, `config.modules.crud.${selectedDb}.collections`, {})
  const collectionNames = Object.keys(collections).filter(col => col !== "default" && col !== "events_log")
  let selectedCollection = get(state, `uiState.database.${selectedDb}.selectedCollection`, '')
  if (selectedCollection === '' && collectionNames.length > 0) {
    selectedCollection = collectionNames[0]
  }
  const selectedSchema = selectedCollection === '' ? '' : collections[selectedCollection].schema
  return {
    projectId: ownProps.match.params.projectId,
    selectedDb: selectedDb,
    collections: collectionNames,
    selectedCollection: selectedCollection,
    selectedSchema: selectedSchema
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const projectId = ownProps.match.params.projectId
  const selectedDb = ownProps.match.params.database;
  const collections = get(store.getState(), `config.modules.crud.${selectedDb}.collections`, {})
  return {
    handleSchemaChange: (collectionName, value) => {
      dispatch(
        set(
          `config.modules.crud.${selectedDb}.collections.${collectionName}.schema`,
          value
        )
      );
    },
    handleSelection: collectionName => {
      dispatch(set(`uiState.database.${selectedDb}.selectedCollection`, collectionName));
    },
    handleReloadSchema: () => {
      dispatch(increment("pendingRequests"))
      client.handleReloadSchema(projectId, selectedDb)
        .then(colls => {
          const newCollections = Object.assign({}, collections)
          Object.entries(colls).forEach(([key, value]) => {
            newCollections[key].schema = value.schema
          })
          dispatch(set(`config.modules.crud.${selectedDb}.collections`, newCollections))
        })
        .catch(error => {
          console.log("Error", error)
          notify("error", "Error", 'Could not reload schema')
        })
        .finally(() => dispatch(decrement("pendingRequests")))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Schema);
