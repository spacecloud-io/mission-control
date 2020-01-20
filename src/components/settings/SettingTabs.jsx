import React from 'react';
import { Tabs } from 'antd';
import { Redirect, useParams } from 'react-router-dom';
import "./SettingTab.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="setting-Tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='General' key='General'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/settings`
            }}
          />
        </TabPane>
        <TabPane tab='Environment Settings' key='Environment Settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/settings/environment`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}