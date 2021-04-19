import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./settings-tabs.css";
import { projectModules } from '../../../constants';
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="settings-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Project settings' key='project'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.SETTINGS}/project`
            }}
          />
        </TabPane>
        <TabPane tab='Cluster settings' key='cluster'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.SETTINGS}/cluster`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}