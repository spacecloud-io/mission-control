import React, { useState } from 'react';

import '../database.css';

import { get, set } from 'automate-redux';

import { connect } from 'react-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import CreateNewCollectionForm from '../../../components/database/overview/collection-form/CreateNewCollectionForm';
import DBTabs from '../../../components/database/Tabs';

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

const Schema = props => {
  const [modalVisible, handleModalVisiblity] = useState(false);

  const collections = Object.keys(props.allCollections);
  let selectedSchema;
  const noOfCollections = collections.length;
  if(noOfCollections < 1){
    selectedSchema = '';
  }
  else{
   selectedSchema = props.allCollections[props.selectedCollection].schema;
  }

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
            activeKey='schema'
            projectId={props.match.params.projectId}
          />
          {noOfCollections > 0 && (
            <div className='rules-schema-table'>
              <div style={{ marginTop: 50, marginBottom: 27 }}>
                <span className='collections'>
                  {props.selectedDb === 'mongo' ? 'Collections' : 'Tables'}
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
                  {props.selectedDb === 'mongo' ? 'collection' : 'table'}
                </Button>
              </div>
              <div className='rules-main-wrapper'>
                <Row>
                  <Col span={6}>
                    <div className='box-heading'>Name</div>
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
                            props.handleSchemaChange(
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
            selectedDb={props.selectedDb}
            visible={modalVisible}
            handleCancel={() => handleModalVisiblity(false)}
            handleSubmit={(item, rules, schema, realtime) => {
              props.handleSelection(item);
              props.handleCreateCollection(item, rules, schema, realtime);
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
      `uiState.database.${selectedDb}.selectedCollection`,
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
    handleSchemaChange: (collectionName, value) => {
      dispatch(
        set(
          `config.modules.crud.${selectedDb}.collections.${collectionName}.schema`,
          value
        )
      );
    },

    handleCreateCollection: (name, rules, schema, realtime) => {
      let collection = {
        isRealtimeEnabled: realtime,
        rules: rules,
        schema: schema
      };

      dispatch(
        set(`config.modules.crud.${selectedDb}.collections.${name}`, collection)
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
)(Schema);
