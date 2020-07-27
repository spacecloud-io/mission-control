import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';
import { Button, Table, Popconfirm, Alert } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import history from '../../../history';
import { notify, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../../utils';
import { defaultPreparedQueryRule, securityRuleGroups, projectModules } from '../../../constants';
import { deletePreparedQuery, getDbDefaultPreparedQuerySecurityRule, getDbPreparedQueries } from '../../../operations/database'

const PreparedQueries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const preparedQueries = useSelector(state => getDbPreparedQueries(state, selectedDB))
  let defaultRule = useSelector(state => getDbDefaultPreparedQuerySecurityRule(state, selectedDB))

  // Derived state
  const preparedQueriesData = Object.keys(preparedQueries).map(id => ({ name: id })).filter(obj => obj.name !== "default")
  if (Object.keys(defaultRule).length === 0) {
    defaultRule = defaultPreparedQueryRule
  }

  useEffect(() => {
    ReactGA.pageview("/projects/database/prepared-queries");
  }, [])

  // Handlers
  const handleSecureClick = (queryName) => openSecurityRulesPage(projectID, securityRuleGroups.DB_PREPARED_QUERIES, queryName, selectedDB)

  const handleDeletePreparedQuery = (id) => {
    incrementPendingRequests()
    deletePreparedQuery(projectID, selectedDB, id)
      .then(() => notify("success", "Success", "Removed prepared query successfully"))
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
      key: 'name'
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
            <h3 style={{ display: "flex", justifyContent: "space-between" }}>
              Prepared queries
                <Button type="primary" onClick={() => history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries/add`)}>Add</Button>
            </h3>
            <Table
              columns={preparedQueriesColumns}
              dataSource={preparedQueriesData}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default PreparedQueries