import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./integration-tabs.css"
import { projectModules } from '../../../constants';
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="integration-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Explore' key='explore'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.INTEGRATIONS}/explore`
            }}
          />
        </TabPane>
        <TabPane tab='Installed' key='installed'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.INTEGRATIONS}/installed`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}