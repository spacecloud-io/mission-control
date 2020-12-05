import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./deployment-tabs.css"
import { projectModules } from '../../../constants';
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="deployment-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.DEPLOYMENTS}/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Routes' key='routes'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.DEPLOYMENTS}/routes`
            }}
          />
        </TabPane>
        <TabPane tab='Roles' key='roles'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.DEPLOYMENTS}/roles`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}