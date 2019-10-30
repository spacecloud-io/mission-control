import React from 'react';
import { Tabs } from 'antd';
import { Redirect, useParams } from 'react-router-dom';
import "./db-tabs.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID, selectedDB }) => {
  return (
    <div className="db-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Rules' key='rules'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/rules`
            }}
          />
        </TabPane>
        <TabPane tab='Schema' key='schema'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/schema`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}