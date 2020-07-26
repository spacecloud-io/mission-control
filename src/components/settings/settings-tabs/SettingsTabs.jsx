import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./settings-tabs.css";
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="settings-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Project settings' key='project'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/settings/project`
            }}
          />
        </TabPane>
        <TabPane tab='Cluster settings' key='cluster'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/settings/cluster`
            }}
          />
        </TabPane>
        <TabPane tab='License' key='license'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/settings/license`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}