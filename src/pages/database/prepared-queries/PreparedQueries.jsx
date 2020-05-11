import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { get, set } from 'automate-redux';
import ReactGA from 'react-ga';
import PreparedQueriesRuleForm from '../../../components/database/prepared-queries-rule-form/PreparedQueriesRuleForm';
import { Button, Table, Popconfirm, Alert } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import '../database.css';
import history from '../../../history';


const PreparedQueries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const [ruleModal, setRuleModal] = useState(false)

  useEffect(() => {
    ReactGA.pageview("/projects/database/prepared-queries");
  }, [])

  const alertDesc = <React.Fragment>
      <p><a style={{ color:"#1890FF" }}>Prepared queries</a> can be used to execute raw SQL queries on your database directly via the GraphQL API of Space Cloud. You can secure the access of prepared queries with <a style={{ color:"#1890FF" }}>security rules</a>.</p>
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
          <a>Edit</a>
          <a onClick={() => setRuleModal(true)}>Secure</a>
          <Popconfirm title={`This will delete all the data from ${name}. Are you sure?`} >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  const data = [
    {
      name: 'abc'
    },
    {
      name: "xyz"
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
            {!data && <Alert 
                message="Info"
                description={alertDesc}
                type="info"
                showIcon
                />}
            <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                Prepared queries
                <Button type="primary" style={{ width:"10%" }} onClick={() => history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries/add-prepared-queries`)}>Add</Button>
            </h3>
            <Table 
              columns={preparedQueriesColumns}
              dataSource={data}
            />
          </div>
        </div>
      </div>
      {ruleModal && <PreparedQueriesRuleForm 
      handleCancel={() => setRuleModal(false) }/>}
    </React.Fragment>
  );
}

export default PreparedQueries