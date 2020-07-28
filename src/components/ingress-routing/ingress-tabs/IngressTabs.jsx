import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./ingress-tabs.css"
import { projectModules } from '../../../constants';
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="ingress-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.INGRESS_ROUTES}/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Settings' key='settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.INGRESS_ROUTES}/settings`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}