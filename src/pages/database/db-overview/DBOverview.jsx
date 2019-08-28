import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';

import { get, set } from 'automate-redux';
import store from '../../../store';

import { Redirect, Link } from 'react-router-dom';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import Documentation from '../../../components/documentation/Documentation';
import DbConfigure from '../../../components/database-rules/DbConfigure';
import EditItemModal from '../../../components/edit-item-modal/EditItemModal';
import rulesImg from '../../../assets/rules.svg';
import EmptyState from '../../../components/rules/EmptyState';
import DBTabs from '../../../components/database/Tabs';

import '../style.css';
import '../../../index.css';

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

  var collections = props.array
    ? props.collections.map((_, index) => `Collection ${index + 1}`)
    : Object.keys(props.collections);

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
         <DBTabs path={props.match.params.database} defaultKey="1"/>
          <div style={{ padding: '48px 120px 0 56px' }}>
            <div style={{ marginBottom: 100 }}>
              <div style={{ float: 'right' }}>
                <Documentation url='https://spaceuptech.com/docs/database' />
              </div>
              <DbConfigure
                updateFormState={props.updateFormState}
                formState={props.formState}
              />
            </div>
            {noOfCollections > 0 && (
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
                    {collections.map((value, index) => (
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
                    {collections.map((value, index) => (
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
                    {collections.map((value, index) => (
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
              handleSubmit={props.handleCreateCollection}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

 const mapStateToProps = (state, ownProps) => {
    const selectedDb = ownProps.match.params.database;
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
  