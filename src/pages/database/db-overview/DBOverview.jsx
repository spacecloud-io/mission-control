import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';

import { Redirect, Link } from 'react-router-dom';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import Documentation from '../../../components/documentation/Documentation';
import DbConfigure from '../../../components/database-rules/DbConfigure';
import EditItemModal from '../../../components/edit-item-modal/EditItemModal';
import rulesImg from '../../../assets/rules.svg';
import EmptyState from '../../../components/rules/EmptyState';

import '../style.css';
import '../../../index.css';

import {mapStateToProps, mapDispatchToProps } from '../db-store';

// antd
import { Col, Row, Button, Icon, Divider, Switch } from 'antd';
import { Tabs } from 'antd';
const { TabPane } = Tabs;

const Overview = props => {
  const [modalVisible, handleModalVisiblity] = useState(false);

  useEffect(() => {
    //
  });

  /*   const handleDeleteClick = (e, rule) => {
    e.stopPropagation();
    props.handleDeleteRule(rule);
  }; */

  var graphs = props.array
    ? props.graphs.map((_, index) => `Graph ${index + 1}`)
    : Object.keys(props.graphs);

  const noOfGraphs = Object.keys(props.graphs).length;

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
            {noOfGraphs > 0 && (
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
                    {graphs.map((value, index) => (
                      <li
                        className={
                          index === props.selectedCollection
                            ? 'tabledata activedata'
                            : 'tabledata'
                        }
                        key={value}
                        onClick={() => props.handleSelection(index)}
                      >
                        {value}
                      </li>
                    ))}
                  </Col>
                  <Col span={6}>
                    <div className='tablehead'>Actions</div>
                    {graphs.map((value, index) => (
                      <li
                        className={
                          index === props.selectedCollection
                            ? 'tabledata activedatabackground'
                            : 'tabledata'
                        }
                        key={value}
                      >
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
                    {graphs.map((value, index) => (
                      <li
                        className={
                          index === props.selectedCollection
                            ? 'tabledata activedatabackground'
                            : 'tabledata'
                        }
                        key={value}
                      >
                        <Switch defaultChecked />
                      </li>
                    ))}
                  </Col>
                </Row>
              </div>
            )}

            {!noOfGraphs && (
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
              rulesInitialValue = 'rules'
              schemaInitialValue = 'schema'
              visible={modalVisible}
              handleCancel={() => handleModalVisiblity(false)}
              handleSubmit={props.handleCreateGraph}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
