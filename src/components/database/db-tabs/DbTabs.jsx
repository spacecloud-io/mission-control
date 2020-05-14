import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import { useSelector } from "react-redux";
import "./db-tabs.css"
import { getProjectConfig } from '../../../utils';
import { dbTypes } from '../../../constants';
const { TabPane } = Tabs;

export default ({ activeKey, projectID, selectedDB }) => {
  const projects = useSelector(state => state.projects)
  const dbType = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.dbType`, "")
  const showPreparedQueriesTab = [dbTypes.POSTGRESQL, dbTypes.MYSQL, dbTypes.SQLSERVER].some(value => value === dbType)
  return (
    <div className="db-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/overview`
            }}
          />
        </TabPane>
        {showPreparedQueriesTab && <TabPane tab='Prepared Queries' key='preparedQueries'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries`
            }}
          />
        </TabPane>}
        <TabPane tab='Rules' key='rules'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/rules`
            }}
          />
        </TabPane>
        <TabPane tab='Schema' key='schema'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/schema`
            }}
          />
        </TabPane>
        <TabPane tab='Queries' key='queries'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/queries`
            }}
          />
        </TabPane>
        <TabPane tab='Settings' key='settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/settings`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}