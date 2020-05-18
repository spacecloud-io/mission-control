import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ReactGA from 'react-ga';
import SecurityRulesForm from '../../../components/security-rules-form/SecurityRulesForm';
import { Button, Table, Popconfirm, Alert } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import history from '../../../history';
import client from '../../../client';
import { increment, decrement, set } from 'automate-redux'
import { notify, getProjectConfig } from '../../../utils';
import store from '../../../store';
import { defaultPreparedQueryRule } from '../../../constants';
import { setPreparedQueries } from '../dbActions'



const PreparedQueries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const [ruleModal, setRuleModal] = useState(false)
  const projects = useSelector(state => state.projects);
  const preparedQueries = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.preparedQueries`, {});
  const preparedQueriesData = Object.keys(preparedQueries).map(id => ({ name: id })).filter(obj => obj.name !== "default")
  const dispatch = useDispatch();
  const [clickedQuery, setClickedQuery] = useState("");
  let defaultRule = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.preparedQueries.default.rule`, {})
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
      const oldPreparedQuery = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.preparedQueries.${clickedQuery}`);
      const newPreparedQuery = Object.assign({}, oldPreparedQuery, { rule: rule })
      setPreparedQueries(projectID, selectedDB, newPreparedQuery.id, newPreparedQuery.args, newPreparedQuery.sql, newPreparedQuery.rule)
        .then(() => resolve()).catch(ex => reject(ex))
    })
  }

  const handleDeletePreparedQuery = (name) => {
    dispatch(increment("pendingRequests"));
    client.database.deletePreparedQueries(projectID, selectedDB, name)
      .then(() => {
        const preparedQueriesList = getProjectConfig(store.getState().projects, projectID, `modules.db.${selectedDB}.preparedQueries`)
        const newPreparedQueries = delete preparedQueriesList[name]
        store.dispatch(set(`extraConfig.${projectID}.db.${selectedDB}.preparedQueries`, newPreparedQueries))
        notify("success", "Success", "Removed prepared query successfully");
      })
      .catch(ex => {
        notify("error", "Error removing prepared query", ex.toString());
      })
      .finally(() => store.dispatch(decrement("pendingRequests")));
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