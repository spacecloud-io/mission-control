import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./billing-tabs.css"
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="billing-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='Overview' key='overview'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/billing/overview`
            }}
          />
        </TabPane>
        <TabPane tab='Invoices' key='invoices'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/billing/invoices`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}