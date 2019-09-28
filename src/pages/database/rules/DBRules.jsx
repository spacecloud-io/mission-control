import React, { useState } from 'react';
import { connect } from 'react-redux';
import { get, set } from 'automate-redux';

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
import { createTable } from '../../../utils';

const Rules = ({ projectId, selectedDb, collections, selectedCollection, selectedRule, defaultRule, handleRuleChange, handleSelection }) => {
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
            activeKey='rules'
            projectId={projectId}
          />
          <div className="db-tab-content">
            {collections.length > 0 && (
              <div className='rules-schema-table'>
                <div style={{ textAlign: "right" }}>
                  <Documentation url="https://docs.spaceuptech.com/essentials/schema" />
                </div>
                <div className='rules-main-wrapper'>
                  <div className="rules-header">
                    <Icon type="bulb" /><span>Hint : To indent press ctrl + A in the editor and then shift + tab</span>
                  </div>
                  <Row>
                    <Col span={6}>
                      <div className='rulesTable'>
                        {collections.map((collection, index) => {
                          return (
                            <div
                              className={
                                selectedCollection === collection
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
                              selectedRule
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
                              handleRuleChange(
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
  const collectionNames = Object.keys(collections)
  let selectedCollection = get(state, `uiState.database.${selectedDb}.selectedCollection`, '')
  if (selectedCollection === '' && collectionNames.length > 0) {
    selectedCollection = collectionNames[0]
  }
  const selectedRule = selectedCollection === '' ? '' : collections[selectedCollection].rules
  return {
    projectId: ownProps.match.params.projectId,
    selectedDb: selectedDb,
    collections: collectionNames,
    selectedCollection: selectedCollection,
    selectedRule: selectedRule
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const selectedDb = ownProps.match.params.database;
  return {
    handleRuleChange: (collectionName, value) => {
      dispatch(
        set(
          `config.modules.crud.${selectedDb}.collections.${collectionName}.rules`,
          value
        )
      );
    },
    handleSelection: collectionName => {
      dispatch(set(`uiState.database.${selectedDb}.selectedCollection`, collectionName));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rules);
