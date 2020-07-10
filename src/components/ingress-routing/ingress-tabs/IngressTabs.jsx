import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./ingress-tabs.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="ingress-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/ingress-routes/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Settings' key='settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/ingress-routes/settings`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}