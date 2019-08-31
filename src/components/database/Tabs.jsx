import React from 'react';
import {Tabs} from 'antd';
import {Redirect } from 'react-router-dom';
const { TabPane } = Tabs;

export default ({projectId, selectedDatabase, activeKey}) => {

    return(
         <Tabs defaultActiveKey={activeKey} >
            <TabPane tab='Overview' key='overview'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/${projectId}/database/overview/${selectedDatabase}`
                }}
              />
            </TabPane>
            <TabPane tab='Rules' key='rules'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/${projectId}/database/rules/${selectedDatabase}`
                }}
              />
            </TabPane>
            <TabPane tab='Schema' key='schema'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/${projectId}/database/schema/${selectedDatabase}`
                }}
              />
            </TabPane>
          </Tabs>
    )}