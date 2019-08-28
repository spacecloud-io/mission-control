import React, { useState, useEffect } from 'react';

import '../style.css';
import '../../../index.css';

import { get, set } from 'automate-redux';

import { connect } from 'react-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import DBTabs from '../../../components/database/Tabs';

import EditItemModal from '../../../components/edit-item-modal/EditItemModal';

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
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const Rules = props => {
  /*   var rules = props.array
    ? props.location.state.rules.map((_, index) => `Rule ${index + 1}`)
    : Object.keys(props.location.state.rules); */

  const [selected, setSelected] = useState(Object.keys(props.collections)[props.selectedCollection]);
  const [modalVisible, handleModalVisiblity] = useState(false);

  var collections =  Object.keys(props.collections);

  const noOfCollections = Object.keys(props.collections).length;

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
        <DBTabs path={props.match.params.database} defaultKey="2"/>
          {noOfCollections > 0 && (
            <div className='rules-schema-table'>
              <div style={{ marginTop: 50, marginLeft: 75, marginBottom: 27 }}>
                <span className='collections'>Collections</span>
                <Button
                  type='primary'
                  style={{
                    float: 'right',
                    backgroundColor: '#1890FF',
                    borderColor: '#1890FF'
                  }}
                  onClick={() => handleModalVisiblity(true)}
                >
                  <Icon type='plus' /> Add a collection
                </Button>
              </div>
              <div className='rules-main-wrapper'>
                <Row>
                  <Col span={6}>
                    <div
                      className='addaRule'
                    >
                      Name
                    </div>
                    <div className='rulesTable'>
                      {collections.map((collection, index) => {
                        return (
                          <div
                            className={
                              props.selectedCollection === index
                                ? 'tabledata activedata'
                                : 'tabledata'
                            }
                            id='rule'
                            value={collection}
                            key={collection}
                            onClick={() => {
                              props.handleSelection(index);
                              setSelected(Object.keys(props.collections)[index]);
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
                          value={props.collections[selected].rules}
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
                            props.handleRuleChange(selected, value);
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
          <EditItemModal
              heading='Add a Collection'
              placeholder='Enter a table name'
              rulesInitialValue='"create": {
                "rule": "allow"
              },
              "read": {
                "rule": "allow"
              },
              "update": {
                "rule": "allow"
              },
              "delete": {
                "rule": "allow"
              }'
              schemaInitialValue='type Todos {}'
              visible={modalVisible}
              handleCancel={() => handleModalVisiblity(false)}
              handleSubmit={(values) => {
                props.handleSelection(collections.length);
                setSelected(values.item);
                props.handleCreateCollection(values);
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
    rules: get(
      state,
      `config.modules.crud.${ownProps.match.params.database}.collections`,
      {}
    ),
    selectedCollection: get(state, 'collection', 0),
    
    collections: get(state, `config.modules.crud.${selectedDb}.collections`, {})
  };
};

 const mapDispatchToProps = (dispatch, ownProps, state) => {
  const selectedDb = ownProps.match.params.database;
  return {

    handleCreateCollection: values => {
      const callName = values.item;
      let collection = {
        isRealtimeEnabled: true,
        rules: values.rules,
        schema: values.schema
      };

      dispatch(
        set(`config.modules.crud.${selectedDb}.collections.${callName}`, collection)
      );
    },
   
    handleSelection: collectionid => {
      dispatch(set('collection', collectionid));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rules);