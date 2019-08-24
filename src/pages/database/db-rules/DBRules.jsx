import React, { useState, useEffect } from 'react';

import '../style.css';
import '../../../index.css';

import { get, set } from 'automate-redux';
import store from '../../../store';
import { connect } from 'react-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import { Redirect } from 'react-router-dom';

import EditItemModal from '../../../components/edit-item-modal/EditItemModal';
import projectId from '../../../assets/projectId.svg';

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

  const [selected, setSelected] = useState(null);
  const [modalVisible, handleModalVisiblity] = useState(false);

  useEffect(() => {
    if (props.array && props.rules.length) {
      setSelected(0);
    } else if (!props.array && Object.keys(props.rules).length) {
      setSelected(Object.keys(props.rules)[0]);
    }
    console.log(Object.keys(props.rules)[0]);
  }, []);

  var rules = props.array
    ? props.rules.map((_, index) => `Rule ${index + 1}`)
    : Object.keys(props.rules);

  const noOfRules = Object.keys(props.rules).length;
  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
        selectedDb={props.selectedDb}
      />
      <div className='flex-box'>
        <Sidenav selectedItem='database' />
        <div className='page-content'>
          <Tabs defaultActiveKey='2'>
            <TabPane tab='Overview' key='1'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/:projectId/database/overview/${props.match.params.database}`
                }}
              />
            </TabPane>
            <TabPane tab='Rules' key='2'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/:projectId/database/rules/${props.match.params.database}`
                }}
              />
            </TabPane>
            <TabPane tab='Schema' key='3'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/:projectId/database/schema/${props.match.params.database}`
                }}
              />
            </TabPane>
          </Tabs>
          {noOfRules > 0 && (
            <div>
              <div style={{ marginTop: 100, marginLeft: 75, marginBottom: 27 }}>
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
              <Row style={{ marginLeft: 75 }}>
                <Col span={6}>
                  <div className='tablehead'>Name</div>
                  {rules.map((value, index) => (
                    <li
                      className={
                        props.selectedCollection === index
                          ? 'tabledata activedata'
                          : 'tabledata'
                      }
                      key={value}
                      onClick={() => {
                        props.handleSelection(index);
                        setSelected(Object.keys(props.rules)[index])}}
                    >
                      {value}
                    </li>
                  ))}
                </Col>
                <Col span={18}>
                  <div className='codebox'>
                    Hint : To indent press <b>ctrl + A</b> in the editor and
                    then <b>shift + tab</b>
                  </div>
                  <div className='code-mirror'>
                    <CodeMirror
                      value={props.rules[selected]}
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
                </Col>
              </Row>
            </div>
          )}
          {!noOfRules && (
            <EmptyState
              graphics={rulesImg}
              desc='Guard your data with rules that define who has access to it and how it is structured.'
              buttonText='Add a table'
              handleClick={() => handleModalVisiblity(true)}
            />
          )}
          <EditItemModal
            graphics={projectId}
            heading='Table name'
            name='Give a table name'
            desc="Note: This doesn't actually creates a table. It's for writing rules for a table"
            placeholder='Enter a table name'
            visible={modalVisible}
            handleCancel={() => handleModalVisiblity(false)}
            handleSubmit={props.handleCreateRule}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state, ownProps) => {
  return {
    selectedDb: ownProps.match.params.database,
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
    selectedCollection: get(state, 'collection', 0)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const selectedDb = ownProps.match.params.database;
  return {
    handleRuleChange: (ruleName, value) => {
      dispatch(
        set(`config.modules.crud.${selectedDb}.collections.${ruleName}`, value)
      );
    },
    handleDeleteRule: ruleName => {
      const rules = get(
        store.getState(),
        `config.modules.crud.${selectedDb}.collections`
      );
      delete rules[ruleName];
      dispatch(set(`config.modules.crud.${selectedDb}.collections`, rules));
    },
    handleCreateRule: ruleName => {
      const defaultRule = {
        isRealtimeEnabled: true,
        rules: {
          create: {
            rule: 'allow'
          },
          read: {
            rule: 'allow'
          },
          update: {
            rule: 'allow'
          },
          delete: {
            rule: 'allow'
          }
        }
      };
      dispatch(
        set(
          `config.modules.crud.${selectedDb}.collections.${ruleName}`,
          JSON.stringify(defaultRule, null, 2)
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
    handleSelection: collectionid => {
      dispatch(set('collection', collectionid));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rules);
