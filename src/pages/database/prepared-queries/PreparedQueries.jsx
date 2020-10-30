import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Table, Popconfirm, Alert, Input, Empty } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import history from '../../../history';
import { notify, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../../utils';
import { defaultPreparedQueryRule, securityRuleGroups, projectModules, actionQueuedMessage } from '../../../constants';
import { deletePreparedQuery, getDbDefaultPreparedQuerySecurityRule, getDbPreparedQueries } from '../../../operations/database'
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../../components/utils/empty-search-results/EmptySearchResults";

const PreparedQueries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const [searchText, setSearchText] = useState('')
  // Global state
  const preparedQueries = useSelector(state => getDbPreparedQueries(state, selectedDB))
  let defaultRule = useSelector(state => getDbDefaultPreparedQuerySecurityRule(state, selectedDB))

  // Derived state
  const preparedQueriesData = Object.keys(preparedQueries).map(id => ({ name: id })).filter(obj => obj.name !== "default")
  if (Object.keys(defaultRule).length === 0) {
    defaultRule = defaultPreparedQueryRule
  }

  const filteredPreparedQueriesData = preparedQueriesData.filter(query => {
    return query.name.toLowerCase().includes(searchText.toLowerCase());
  })

  // Handlers
  const handleSecureClick = (queryName) => openSecurityRulesPage(projectID, securityRuleGroups.DB_PREPARED_QUERIES, queryName, selectedDB)

  const handleDeletePreparedQuery = (id) => {
    incrementPendingRequests()
    deletePreparedQuery(projectID, selectedDB, id)
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : "Removed prepared query successfully")
      })
      .catch(ex => notify("error", "Error removing prepared query", ex))
      .finally(() => decrementPendingRequests());
  }

  const alertDesc = <React.Fragment>
    <p><a style={{ color: "#1890FF" }} href="https://docs.spaceuptech.com/storage/database/prepared-queries/">Prepared queries</a> can be used to execute raw SQL queries on your database directly via the GraphQL API of Space Cloud. You can secure the access of prepared queries with <a style={{ color: "#1890FF" }} href="https://docs.spaceuptech.com/storage/database/prepared-queries/#securing-prepared-queries">security rules</a>.</p>
  </React.Fragment>

  const preparedQueriesColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value) => {
        return <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      }
    },

    {
      title: 'Actions',
      key: 'actions',
      className: 'column-actions',
      render: (_, { name }) => (
        <span>
          <a onClick={() => history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries/${name}/edit`)}>Edit</a>
          <a onClick={() => handleSecureClick(name)}>Secure</a>
          <Popconfirm title={`This will delete all the data from ${name}. Are you sure?`} onConfirm={() => handleDeletePreparedQuery(name)}>
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem={projectModules.DATABASE} />
        <div className='page-content page-content--no-padding'>
          <DBTabs activeKey='preparedQueries' projectID={projectID} selectedDB={selectedDB} />
          <div className="db-tab-content">
            {preparedQueriesData.length === 0 && <Alert
              message="Info"
              description={alertDesc}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
              <h3 style={{ margin: 'auto 0' }}>Prepared queries {filteredPreparedQueriesData.length ? `(${filteredPreparedQueriesData.length})` : ''}</h3>
              <div style={{ display: "flex" }}>
                <Input.Search placeholder='Search by prepared query name' onChange={e => setSearchText(e.target.value)} allowClear={true} style={{ minWidth: '320px' }} />
                <Button type="primary" style={{ marginLeft: '16px' }} onClick={() => history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries/add`)}>Add</Button>
              </div>
            </div>
            <Table
              columns={preparedQueriesColumns}
              dataSource={filteredPreparedQueriesData}
              locale={{
                emptyText: preparedQueriesData.length !== 0 ?
                  <EmptySearchResults searchText={searchText} /> :
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No prepared query created yet. Add a prepared query' />
              }} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default PreparedQueries