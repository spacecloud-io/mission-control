import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';
import SecurityRulesForm from '../../../components/security-rules-form/SecurityRulesForm';
import { Button, Table, Popconfirm, Alert } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import history from '../../../history';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../../utils';
import { defaultPreparedQueryRule } from '../../../constants';
import { deletePreparedQuery, savePreparedQuerySecurityRule, getDbDefaultPreparedQuerySecurityRule, getDbPreparedQueries } from '../../../operations/database'

const PreparedQueries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const [ruleModal, setRuleModal] = useState(false)

  // Global state
  const preparedQueries = useSelector(state => getDbPreparedQueries(state, selectedDB))
  let defaultRule = useSelector(state => getDbDefaultPreparedQuerySecurityRule(state, selectedDB))

  // Derived properties
  const preparedQueriesData = Object.keys(preparedQueries).map(id => ({ name: id })).filter(obj => obj.name !== "default")
  const [clickedQuery, setClickedQuery] = useState("");
  if (Object.keys(defaultRule).length === 0) {
    defaultRule = defaultPreparedQueryRule
  }

  useEffect(() => {
    ReactGA.pageview("/projects/database/prepared-queries");
  }, [])

  const handleSecureClick = (queryName) => {
    setClickedQuery(queryName)
    setRuleModal(true)
  }

  const handleSecureSubmit = (rule) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      savePreparedQuerySecurityRule(projectID, selectedDB, clickedQuery, rule)
        .then(() => resolve())
        .catch(ex => reject(ex))
        .finally(() => decrementPendingRequests())
    })
  }

  const handleDeletePreparedQuery = (id) => {
    incrementPendingRequests()
    deletePreparedQuery(projectID, selectedDB, id)
      .then(() => notify("success", "Success", "Removed prepared query successfully"))
      .catch(ex => notify("error", "Error removing prepared query", ex))
      .finally(() => decrementPendingRequests());
  }

  // TODO: Add links here
  const alertDesc = <React.Fragment>
    <p><a style={{ color: "#1890FF" }}>Prepared queries</a> can be used to execute raw SQL queries on your database directly via the GraphQL API of Space Cloud. You can secure the access of prepared queries with <a style={{ color: "#1890FF" }}>security rules</a>.</p>
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
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <DBTabs activeKey='preparedQueries' projectID={projectID} selectedDB={selectedDB} />
          <div className="db-tab-content">
            {preparedQueriesData.length === 0 && <Alert
              message="Info"
              description={alertDesc}
              type="info"
              showIcon
            />}
            <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
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
      {ruleModal && <SecurityRulesForm
        currentRule={clickedQuery ? preparedQueries[clickedQuery].rule : undefined}
        defaultRule={defaultRule}
        handleSubmit={handleSecureSubmit}
        handleCancel={() => setRuleModal(false)} />}
    </React.Fragment>
  );
}

export default PreparedQueries