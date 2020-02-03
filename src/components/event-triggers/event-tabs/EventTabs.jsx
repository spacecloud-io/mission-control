import React from 'react';
import { Tabs } from 'antd';
import { Redirect, useParams } from 'react-router-dom';
import "./event-tabs.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="event-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/event-triggers/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Rules' key='rules'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/event-triggers/rules`
            }}
          />
        </TabPane>
        <TabPane tab='Schema' key='schema'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/event-triggers/schema`
            }}
          />
        </TabPane>
        <TabPane tab='Settings' key='settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/event-triggers/settings`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}