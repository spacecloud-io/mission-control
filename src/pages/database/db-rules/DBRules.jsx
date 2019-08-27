import React, { useState, useEffect } from 'react';

import '../style.css';
import '../../../index.css';

import { connect } from 'react-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import { Redirect } from 'react-router-dom';

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

import {mapStateToProps, mapDispatchToProps } from '../db-store';

// antd
import { Button, Icon, Col, Row } from 'antd';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const Rules = props => {
  /*   var rules = props.array
    ? props.location.state.rules.map((_, index) => `Rule ${index + 1}`)
    : Object.keys(props.location.state.rules); */

  const [selected, setSelected] = useState(Object.keys(props.graphs)[0]);
  const [modalVisible, handleModalVisiblity] = useState(false);

  useEffect(() => {
    if (props.array && props.rules.length) {
      setSelected(0);
    } else if (!props.array && Object.keys(props.rules).length) {
      setSelected(Object.keys(props.graphs)[0]);
    }
  }, []);

  var graphs = props.array
    ? props.graphs.map((_, index) => `Rule ${index + 1}`)
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
          {noOfGraphs > 0 && (
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
                  {graphs.map((value, index) => (
                    <li
                      className={
                        props.selectedCollection === index
                          ? 'tabledata activedata'
                          : 'tabledata'
                      }
                      key={value}
                      onClick={() => {
                      
                        props.handleSelection(index);
                        setSelected(Object.keys(props.graphs)[index]);
                      }}
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
                      value={props.graphs[selected].rules}
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
            rulesInitialValue='rules'
            schemaInitialValue='schema'
            visible={modalVisible}
            handleCancel={() => handleModalVisiblity(false)}
            handleSubmit={(values) => {
              props.handleSelection(graphs.length);
              setSelected(values.item);
              props.handleCreateGraph(values);
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rules);
