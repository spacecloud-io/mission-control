import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./event-tabs.css"
import { projectModules } from '../../../constants';
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="event-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.EVENTING}/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Rules' key='rules'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.EVENTING}/rules`
            }}
          />
        </TabPane>
        <TabPane tab='Schema' key='schema'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.EVENTING}/schema`
            }}
          />
        </TabPane>
        <TabPane tab='Event Logs' key='event-logs'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.EVENTING}/event-logs`
            }}
          />
        </TabPane>
        <TabPane tab='Settings' key='settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/${projectModules.EVENTING}/settings`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}