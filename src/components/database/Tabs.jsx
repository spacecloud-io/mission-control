import React, { useState } from 'react';
import {Tabs} from 'antd';
import {Redirect } from 'react-router-dom';
const { TabPane } = Tabs;

export default (props) => {

    return(
         <Tabs defaultActiveKey={props.defaultKey} >
            <TabPane tab='Overview' key='1'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/:projectId/database/overview/${props.path}`
                }}
              />
            </TabPane>
            <TabPane tab='Rules' key='2'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/:projectId/database/rules/${props.path}`
                }}
              />
            </TabPane>
            <TabPane tab='Schema' key='3'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/:projectId/database/schema/${props.path}`
                }}
              />
            </TabPane>
          </Tabs>
    )}