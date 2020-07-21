import React from 'react';
import { Tabs } from 'antd';
import { Redirect, useParams } from 'react-router-dom';
import "./integration-tabs.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="integration-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Explore' key='explore'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/integrations/explore`
            }}
          />
        </TabPane>
        <TabPane tab='Installed' key='installed'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/integrations/installed`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}