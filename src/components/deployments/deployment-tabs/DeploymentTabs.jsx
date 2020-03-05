import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./deployment-tabs.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="deployment-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/deployments/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Rules' key='rules'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/deployments/rules`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}