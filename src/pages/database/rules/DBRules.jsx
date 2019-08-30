import React, { useState } from 'react';

import '../database.css';
import '../../../index.css';

import { get, set } from 'automate-redux';

import { connect } from 'react-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import DBTabs from '../../../components/database/Tabs';

import CreateNewCollectionForm from '../../../components/database/overview/collection-form/CreateNewCollectionForm';

import rulesImg from '../../../assets/rules.svg';
import EmptyState from '../../../components/rules/EmptyState';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

// antd
import { Button, Icon, Col, Row } from 'antd';

const Rules = props => {
  const [modalVisible, handleModalVisiblity] = useState(false);
  

  var collections = Object.keys(props.allCollections);
  var selectedRule = props.allCollections[props.selectedCollection].rules;
  const noOfCollections = Object.keys(props.allCollections).length;

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
            activeKey='rules'
            projectId={props.match.params.projectId}
          />
          {noOfCollections > 0 && (
            <div className='rules-schema-table'>
              <div style={{ marginTop: 50, marginLeft: 75, marginBottom: 27 }}>
                <span className='collections'>
                  {props.selectedDb === 'mongo' ? 'Collection' : 'Table'}
                </span>
                <Button
                  type='primary'
                  style={{
                    float: 'right',
                    backgroundColor: '#1890FF',
                    borderColor: '#1890FF'
                  }}
                  onClick={() => handleModalVisiblity(true)}
                >
                  <Icon type='plus' /> Add a{' '}
                  {props.selectedDb === 'mongo' ? 'Collection' : 'Table'}
                </Button>
              </div>
              <div className='rules-main-wrapper'>
                <Row>
                  <Col span={6}>
                    <div className='addaRule'>Name</div>
                    <div className='rulesTable'>
                      {collections.map((collection, index) => {
                        return (
                          <div
                            className={
                              props.selectedCollection === collection
                                ? 'tabledata activedata'
                                : 'tabledata'
                            }
                            id='rule'
                            value={collection}
                            key={collection}
                            onClick={() => {
                              props.handleSelection(collection);
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
                      <div className='code-hint'>
                        Hint : To indent press ctrl + A in the editor and then
                        shift + tab
                      </div>
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
                            props.handleRuleChange(
                              props.selectedCollection,
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
          {!noOfCollections && (
            <EmptyState
              graphics={rulesImg}
              desc='Guard your data with rules that define who has access to it and how it is structured.'
              buttonText='Add a table'
              handleClick={() => handleModalVisiblity(true)}
            />
          )}
          <CreateNewCollectionForm
            heading={
              props.selectedDb === 'mongo' ? 'Add a collection' : 'Add a table'
            }
            placeholder={
              props.selectedDb === 'mongo'
                ? 'Enter a collection'
                : 'Enter a table'
            }
            visible={modalVisible}
            handleCancel={() => handleModalVisiblity(false)}
            handleSubmit={(item, rules, schema) => {
              props.handleSelection(item);

              props.handleCreateCollection(item, rules, schema);
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => {
  const selectedDb = ownProps.match.params.database;
  return {
    selectedDb: ownProps.match.params.database,

    selectedCollection: get(
      state,
      'uiState.database.selectedCollection',
      'default'
    ),

    allCollections: get(
      state, 
      `config.modules.crud.${selectedDb}.collections`, 
      {})
  };
};

const mapDispatchToProps = (dispatch, ownProps, state) => {
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

    handleCreateCollection: (name, rules, schema) => {
      let collection = {
        isRealtimeEnabled: true,
        rules: rules,
        schema: schema
      };

      dispatch(
        set(`config.modules.crud.${selectedDb}.collections.${name}`, collection)
      );
    },

    handleSelection: collectionname => {
      dispatch(set('uiState.database.selectedCollection', collectionname));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rules);
