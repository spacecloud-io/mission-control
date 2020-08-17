import React, { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { set } from 'automate-redux';

import { Row, Col, Select, Alert, Form, Checkbox, Tooltip } from 'antd';
import { PlayCircleOutlined } from "@ant-design/icons"
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import QueryBlock from "../../../components/db-query/QueryBlock";
import { generateSchemaASTs, generateSampleQueryDBInsert, generateSampleQueryDBRead, generateSampleQueryDBUpdate, generateSampleQueryDBDelete } from '../../../graphql';

import bookReadingSvg from "../../../assets/bookReading.svg"
import { getCollectionSchema, getTrackedCollections, getDbSchemas } from "../../../operations/database";
import { projectModules } from "../../../constants";

const VariablesPanel = () => {
  return <div style={{
    height: "32px",
    lineHeight: "32px",
    fontSize: "14px",
    fontWeight: "bold",
    paddingLeft: "32px",
    backgroundColor: "#f7f7f7",
    fontFamily: "sans-serif",
    color: "#999"
  }}>
    QUERY VARIABLES
  </div>
}

const OptionsPanel = ({ children }) => {
  return <div style={{ height: "32px", paddingLeft: "16px", display: "flex", alignItems: "center", borderBottom: "1px solid #F0F0F0" }}>
    {children}
  </div>
}

const PlayButton = ({ handleClick }) => {
  return <Tooltip placement="bottom" title="Play in GraphiQL explorer">
    <PlayCircleOutlined style={{ marginRight: "24px", fontSize: "18px", cursor: "pointer" }} onClick={handleClick} />
  </Tooltip>
}

const stringifyQuery = ({ query, variables, response } = {}) => {
  return Object.assign({}, {
    query,
    variables: JSON.stringify(variables, null, 2),
    response: JSON.stringify(response, null, 2)
  })
}

const Queries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const history = useHistory()

  // Global state
  const selectedCol = useSelector(state => state.uiState.selectedCollection)
  const dbSchemas = useSelector(state => getDbSchemas(state, selectedDB))
  const trackedCollectionNames = useSelector(state => getTrackedCollections(state, selectedDB))
  const schema = useSelector(state => getCollectionSchema(state, selectedDB, selectedCol))
  const dispatch = useDispatch()

  // Handlers
  const handleSelect = (colName) => {
    dispatch(set("uiState.selectedCollection", colName))
  }

  useEffect(() => {
    if (trackedCollectionNames.length > 0 && (!selectedCol || !trackedCollectionNames.some(col => col === selectedCol))) {
      handleSelect(trackedCollectionNames[0])
    }
  }, [selectedCol, trackedCollectionNames])

  const [readOptions, setReadOptions] = useState({ applyFilters: false, sort: false, skip: false, limit: false })
  const [updateOptions, setUpdateOptions] = useState({ applyFilters: true, upsert: false })
  const [deleteOptions, setDeleteOptions] = useState({ applyFilters: true })

  const NoTableEmptyState = () => {
    return <div>
      <div className="panel" style={{ margin: 24 }}>
        <img src={bookReadingSvg} style={{ width: 240 }} />
        <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Queries tab provide customized documentation on the GraphQL queries for a particular table/collection</p>
      </div>
      <Row>
        <Col sm={{ span: 24 }} lg={{ span: 16, offset: 4 }}>
          <Alert message="Note" description={`No tracked tables yet. You first need to add a table/collection in order to see its auto generated GraphQL documentation.`} type="info" showIcon />
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
          <Alert message="Note" description={`You first need to describe the schema for ${selectedDB} in order to see its auto generated GraphQL documentation.`} type="info" showIcon />
        </Col>
      </Row>
    </div>
  }


  const dbSchemaASTs = generateSchemaASTs(dbSchemas)
  let readQuery = { query: '', response: '' }
  let insertQuery = { query: '', response: '' }
  let updateQuery = { query: '', response: '' }
  let deleteQuery = { query: '', response: '' }
  if (schema) {
    readQuery = stringifyQuery(generateSampleQueryDBRead(dbSchemaASTs, selectedCol, selectedDB, readOptions.applyFilters, readOptions.sort, readOptions.skip, readOptions.limit))
    insertQuery = stringifyQuery(generateSampleQueryDBInsert(dbSchemaASTs, selectedCol, selectedDB))
    updateQuery = stringifyQuery(generateSampleQueryDBUpdate(dbSchemaASTs, selectedCol, selectedDB, updateOptions.applyFilters, updateOptions.upsert))
    deleteQuery = stringifyQuery(generateSampleQueryDBDelete(dbSchemaASTs, selectedCol, selectedDB, deleteOptions.applyFilters))
  }

  const handlePlay = (request) => {
    dispatch(set("uiState.graphiql", request))
    history.push(`/mission-control/projects/${projectID}/explorer`)
  }
  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem={projectModules.DATABASE} />
        <div className='page-content page-content--no-padding'>
          <DBTabs
            selectedDB={selectedDB}
            projectID={projectID}
            activeKey='queries'
          />
          <div className="db-tab-content">
            {trackedCollectionNames.length === 0 && <NoTableEmptyState />}
            {trackedCollectionNames.length > 0 && <React.Fragment>
              <Select value={selectedCol} style={{ minWidth: 160 }} onChange={handleSelect}>
                {trackedCollectionNames.map(colName => <Select.Option value={colName} >{colName}</Select.Option>)}
              </Select>
              {!schema && <NoSchemaEmptyState />}
              {schema && <React.Fragment>
                <Alert
                  style={{ marginTop: 24 }}
                  message={<div>
                    <b>Note:</b> These are only few sample queries. Visit <a href="https://docs.spaceuptech.com/storage/database/" target="_blank">docs of database module</a> to learn the full querying capabilities
              </div>}
                  description=""
                  type="info"
                  showIcon
                />
                <p className="query-font">Queries</p>
                <p className="query-font-small">Fetch records from {selectedCol} table with filters:</p>
                <Row gutter={48}>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <OptionsPanel>
                        <PlayButton handleClick={() => handlePlay(readQuery)} />
                        <Form initialValues={readOptions} layout="inline" style={{ display: "inline-flex" }} onValuesChange={(_, values) => setReadOptions(values)}>
                          <Form.Item name="applyFilters" valuePropName="checked">
                            <Checkbox>
                              Apply filters
                        </Checkbox>
                          </Form.Item>
                          <Form.Item name="sort" valuePropName="checked">
                            <Checkbox>
                              Sort
                        </Checkbox>
                          </Form.Item>
                          <Form.Item name="skip" valuePropName="checked">
                            <Checkbox>
                              Skip rows
                        </Checkbox>
                          </Form.Item>
                          <Form.Item name="limit" valuePropName="checked">
                            <Checkbox>
                              Limit rows
                        </Checkbox>
                          </Form.Item>
                        </Form>
                      </OptionsPanel>
                      <QueryBlock value={readQuery.query} />
                      <VariablesPanel />
                      <QueryBlock value={readQuery.variables} />
                    </div>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <QueryBlock theme="dark" value={readQuery.response} />
                    </div>
                  </Col>
                </Row>
                <p className="query-font">Mutations</p>
                <p className="query-font-small">Insert a new record in {selectedCol} table:</p>
                <Row gutter={48}>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <OptionsPanel>
                        <PlayButton handleClick={() => handlePlay(insertQuery)} />
                      </OptionsPanel>
                      <QueryBlock value={insertQuery.query} />
                      <VariablesPanel />
                      <QueryBlock value={insertQuery.variables} />
                    </div>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <QueryBlock theme="dark" value={insertQuery.response} />
                    </div>
                  </Col>
                </Row>
                <p className="query-font-small" style={{ marginTop: 15 }}>Update an existing record in {selectedCol} table:</p>
                <Row gutter={48}>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <OptionsPanel>
                        <PlayButton handleClick={() => handlePlay(updateQuery)} />
                        <Form initialValues={updateOptions} layout="inline" style={{ display: "inline-flex" }} onValuesChange={(_, values) => setUpdateOptions(values)}>
                          <Form.Item name="applyFilters" valuePropName="checked">
                            <Checkbox>
                              Apply filters
                        </Checkbox>
                          </Form.Item>
                          <Form.Item name="upsert" valuePropName="checked">
                            <Checkbox>
                              Upsert
                        </Checkbox>
                          </Form.Item>
                        </Form>
                      </OptionsPanel>
                      <QueryBlock value={updateQuery.query} />
                      <VariablesPanel />
                      <QueryBlock value={updateQuery.variables} />
                    </div>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <QueryBlock theme="dark" value={updateQuery.response} />
                    </div>
                  </Col>
                </Row>
                <p className="query-font-small" style={{ marginTop: 15 }}>Delete a record from {selectedCol} table:</p>
                <Row gutter={48} style={{ marginBottom: 25 }}>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <OptionsPanel>
                        <PlayButton handleClick={() => handlePlay(deleteQuery)} />
                        <Form initialValues={deleteOptions} layout="inline" style={{ display: "inline-flex" }} onValuesChange={(_, values) => setDeleteOptions(values)}>
                          <Form.Item name="applyFilters" valuePropName="checked">
                            <Checkbox>
                              Apply filters
                        </Checkbox>
                          </Form.Item>
                        </Form>
                      </OptionsPanel>
                      <QueryBlock value={deleteQuery.query} />
                      <VariablesPanel />
                      <QueryBlock value={deleteQuery.variables} />
                    </div>
                  </Col>
                  <Col lg={{ span: 12 }} md={{ span: 24 }}>
                    <div style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)" }}>
                      <QueryBlock theme="dark" value={deleteQuery.response} />
                    </div>
                  </Col>
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