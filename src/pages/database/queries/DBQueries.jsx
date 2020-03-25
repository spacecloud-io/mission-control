import React from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { set } from 'automate-redux';

import { Row, Col, Select } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import QueryBlock from "../../../components/db-query/QueryBlock";
import { Alert } from "antd";
import { generateGraphQLQueries, getTrackedCollectionNames } from '../../../utils';

const Queries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const selectedCol = useSelector(state => state.uiState.selectedCollection)
  const trackedCollections = useSelector(state => getTrackedCollectionNames(state, projectID, selectedDB))
  const dispatch = useDispatch()

  // Handlers
  const handleSelect = (colName) => dispatch(set("uiState.selectedCollection", colName))

  const queries = generateGraphQLQueries(projectID, selectedDB, selectedCol)

  useEffect(() => {
    if (trackedCollections.length > 0 && (!selectedCol || !trackedCollections.some(col => col === selectedCol))) {
      handleSelect(trackedCollections[0])
    }
  }, [selectedCol, trackedCollections])

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <DBTabs
            selectedDB={selectedDB}
            projectID={projectID}
            activeKey='queries'
          />
          <div className="db-tab-content">
            <Select value={selectedCol} style={{ minWidth: 160 }}>
              {trackedCollections.map(colName => <Select.Option value={colName} onClick={() => handleSelect(colName)}>{colName}</Select.Option>)}
            </Select>
            <Alert
              style={{ marginTop: 24 }}
              message={<div>
                <b>Note:</b> Visit <a href="https://docs.spaceuptech.com/storage/database/" target="_blank">docs for database</a> to learn the full querying capabilities
              </div>}
              description=""
              type="info"
              showIcon
            />
            <p className="query-font">Queries</p>
            <p className="query-font-small">Fetch records from {selectedCol} table with filters:</p>
            <Row gutter={48}>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock value={queries.get.req} /></Col>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock theme="dark" value={queries.get.res} /></Col>
            </Row>
            <p className="query-font">Mutations</p>
            <p className="query-font-small">Insert a new record in {selectedCol} table:</p>
            <Row gutter={48}>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock value={queries.insert.req} /></Col>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock theme="dark" value={queries.insert.res} /></Col>
            </Row>
            <p className="query-font-small" style={{ marginTop: 15 }}>Update an existing record in {selectedCol} table:</p>
            <Row gutter={48}>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock value={queries.update.req} /></Col>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock theme="dark" value={queries.update.res} /></Col>
            </Row>
            <p className="query-font-small" style={{ marginTop: 15 }}>Delete a record from {selectedCol} table:</p>
            <Row gutter={48} style={{ marginBottom: 25 }}>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock value={queries.delete.req} /></Col>
              <Col lg={{ span: 12 }} md={{ span: 24 }}><QueryBlock theme="dark" value={queries.delete.res} /></Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Queries