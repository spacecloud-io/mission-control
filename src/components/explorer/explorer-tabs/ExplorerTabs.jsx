import React from "react";
import { Tabs } from "antd";
import { Redirect } from "react-router-dom";
import "./explorer-tabs.css";
const { TabPane } = Tabs;

export default ({ activeKey, projectID }) => {
  return (
    <div className="explorer-tabs">
      <Tabs defaultActiveKey={activeKey} >
        <TabPane tab='GraphQL' key='graphql'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/explorer/graphql`
            }}
          />
        </TabPane>
        <TabPane tab='Space Api' key='spaceApi'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/explorer/spaceApi`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}