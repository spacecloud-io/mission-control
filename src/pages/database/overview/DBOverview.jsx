import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';

import { get, set } from 'automate-redux';
import store from '../../../store';

import { Link } from 'react-router-dom';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';

import Documentation from '../../../components/documentation/Documentation';
import DbConfigure from '../../../components/database/overview/configure/DbConfigure';
import CreateNewCollectionForm from '../../../components/database/overview/collection-form/CreateNewCollectionForm';
import rulesImg from '../../../assets/rules.svg';
import EmptyState from '../../../components/rules/EmptyState';
import DBTabs from '../../../components/database/Tabs';

import '../database.css';
import '../../../index.css';

// antd
import { Col, Row, Button, Icon, Divider, Switch } from 'antd';

const Overview = props => {
  const [modalVisible, handleModalVisiblity] = useState(false);

  var allCollections = Object.keys(props.allCollections);

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
            activeKey='overview'
            projectId={props.match.params.projectId}
          />
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
                      {props.selectedDb === 'mongo' ? 'Collection' : 'Table'}
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <div className='tablehead'>Name</div>
                    {allCollections.map((value, index) => (
                      <li className='tabledata' key={value}>
                        {value}
                      </li>
                    ))}
                  </Col>
                  <Col span={6}>
                    <div className='tablehead'>Actions</div>
                    {allCollections.map((value, index) => (
                      <li
                        className='tabledata'
                        key={value}
                        onClick={() => props.handleSelection(value)}
                      >
                        <Link
                          to={`/mission-control/projects/${props.match.params.database}/database/schema/mongo`}
                        >
                          Edit Schema
                        </Link>
                        <Divider type='vertical' />
                        <Link
                          to={`/mission-control/projects/${props.match.params.database}/database/rules/mongo`}
                        >
                          Edit Rules
                        </Link>
                      </li>
                    ))}
                  </Col>
                  <Col span={4}>
                    <div className='tablehead'>Realtime</div>
                    {allCollections.map((value, index) => (
                      <li className='tabledata' key={value}>
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
            <CreateNewCollectionForm
              heading={
                props.selectedDb === 'mongo'
                  ? 'Add a Collection'
                  : 'Add a Table'
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
    handleSelection: collectionname => {
      dispatch(set('uiState.database.selectedCollection', collectionname));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
