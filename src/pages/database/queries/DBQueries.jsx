import React from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { set } from 'automate-redux';

import { Row, Col, Select, Alert } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import QueryBlock from "../../../components/db-query/QueryBlock";
import { generateGraphQLQueries, getTrackedCollectionNames, getSchema } from '../../../utils';

import bookReadingSvg from "../../../assets/bookReading.svg"

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
  const schema = getSchema(projectID, selectedDB, selectedCol)

  useEffect(() => {
    if (trackedCollections.length > 0 && (!selectedCol || !trackedCollections.some(col => col === selectedCol))) {
      handleSelect(trackedCollections[0])
    }
  }, [selectedCol, trackedCollections])

  const NoTableEmptyState = () => {
    return <div>
    <div className="panel" style={{ margin: 24 }}>
      <img src={bookReadingSvg} style={{ width: 240 }} />
      <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Queries tab provide customized documentation on the GraphQL queries for a particular table/collection</p>
    </div>
    <Row>
      <Col sm={{ span: 24 }} lg={{ span: 16, offset: 4 }}>
        <Alert message="Note"  description={`No tracked tables yet. You first need to add a table/collection in order to see its auto generated GraphQL documentation.`} type="info"  showIcon  />
      </Col>
    </Row>
  </div>
  }

  const NoSchemaEmptyState = () => {
    return <div>
      <div className="panel" style={{ margin: 24 }}>
        <img src={bookReadingSvg} style={{ width: 240 }} />
        <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Queries tab provide customized documentation on the GraphQL queries for a particular table/collection</p>
      </div>
      <Row>
        <Col sm={{ span: 24 }} lg={{ span: 16, offset: 4 }}>
          <Alert message="Note"  description={`You first need to describe the schema for ${selectedDB} in order to see its auto generated GraphQL documentation.`} type="info"  showIcon  />
        </Col>
      </Row>
    </div>
  }

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
            {trackedCollections.length === 0 && <NoTableEmptyState />}
            {trackedCollections.length > 0 && <React.Fragment>
              <Select value={selectedCol} style={{ minWidth: 160 }}>
                {trackedCollections.map(colName => <Select.Option value={colName} onClick={() => handleSelect(colName)}>{colName}</Select.Option>)}
              </Select>
              {!schema && <NoSchemaEmptyState />}
              {schema && <React.Fragment>
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
              </React.Fragment>}
            </React.Fragment>}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Queries