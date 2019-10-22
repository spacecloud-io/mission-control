import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./db-tabs.css"
const { TabPane } = Tabs;

export default ({ projectId, selectedDatabase, activeKey }) => {

  return (
    <div className="db-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectId}/database/overview/${selectedDatabase}`
            }}
          />
        </TabPane>
        <TabPane tab='Rules' key='rules'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectId}/database/rules/${selectedDatabase}`
            }}
          />
        </TabPane>
        <TabPane tab='Schema' key='schema'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectId}/database/schema/${selectedDatabase}`
            }}
          />
        </TabPane>
        <TabPane tab='Config' key='config'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectId}/database/config/${selectedDatabase}`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}