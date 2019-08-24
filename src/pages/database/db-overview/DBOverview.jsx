import React, { useState, useEffect } from 'react';

import { get, set } from 'automate-redux';
import store from '../../../store';
import { connect } from 'react-redux';

import { Redirect, Link } from 'react-router-dom';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import Documentation from '../../../components/documentation/Documentation';
import DbConfigure from '../../../components/database-rules/DbConfigure';
import EditItemModal from '../../../components/edit-item-modal/EditItemModal';
import projectId from '../../../assets/projectId.svg';
import rulesImg from '../../../assets/rules.svg';
import EmptyState from '../../../components/rules/EmptyState';

import '../style.css';
import '../../../index.css';

// antd
import { Col, Row, Button, Icon, Divider, Switch } from 'antd';
import { Tabs } from 'antd';
const { TabPane } = Tabs;

const Overview = props => {
  const [selected, setSelected] = useState(null);
  const [modalVisible, handleModalVisiblity] = useState(false);

  useEffect(() => {
    if (props.array && props.rules.length) {
      setSelected(0);
    } else if (!props.array && Object.keys(props.rules).length) {
      setSelected(Object.keys(props.rules)[0]);
    }
  }, []);

  const handleDeleteClick = (e, rule) => {
    e.stopPropagation();
    props.handleDeleteRule(rule);
  };
  
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
          <Tabs defaultActiveKey='1'>
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
          <div style={{ marginLeft: 90, marginTop: 80 }}>
            <div style={{ marginBottom: 100 }}>
              <div style={{ float: 'right' }}>
                <Documentation url='https://spaceuptech.com/docs/database' />
              </div>
              <DbConfigure
                updateFormState={props.updateFormState}
                formState={props.formState}
              />
            </div>
            {noOfRules > 0 && (
              <div>
                <Row style={{ marginBottom: 30 }}>
                  <Col span={16}>
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
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <div className='tablehead'>Name</div>
                    {rules.map((value, index) => (
                      <li
                        className={index === props.selectedCollection ? 'tabledata activedata' : 'tabledata'}
                        key={value}
                        onClick={() => props.handleSelection(index)}
                      >
                        {value}
                      </li>
                    ))}
                  </Col>
                  <Col span={6}>
                    <div className='tablehead'>Actions</div>
                    {rules.map((value, index) => (
                      <li className={index === props.selectedCollection ? 'tabledata activedatabackground' : 'tabledata'} key={value}>
                        <Link to='/mission-control/projects/:projectId/database/schema/mongo'>
                          Edit Schema
                        </Link>
                        <Divider type='vertical' />
                        <Link to='/mission-control/projects/:projectId/database/rules/mongo'>
                          Edit Rules
                        </Link>
                      </li>
                    ))}
                  </Col>
                  <Col span={4}>
                    <div className='tablehead'>Realtime</div>
                    {rules.map((value, index) => (
                      <li className={index === props.selectedCollection ? 'tabledata activedatabackground' : 'tabledata'} key={value}>
                        <Switch defaultChecked />
                      </li>
                    ))}
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
)(Overview);
