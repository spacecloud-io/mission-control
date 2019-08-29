import React, { useState } from 'react';
import {Tabs} from 'antd';
import {Redirect } from 'react-router-dom';
const { TabPane } = Tabs;

export default (props) => {

    return(
         <Tabs defaultActiveKey={props.activeKey} >
            <TabPane tab='Overview' key='overview'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/${props.projectId}/database/overview/${props.selectedDatabase}`
                }}
              />
            </TabPane>
            <TabPane tab='Rules' key='rules'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/${props.projectId}/database/rules/${props.selectedDatabase}`
                }}
              />
            </TabPane>
            <TabPane tab='Schema' key='schema'>
              <Redirect
                to={{
                  pathname: `/mission-control/projects/${props.projectId}/database/schema/${props.selectedDatabase}`
                }}
              />
            </TabPane>
          </Tabs>
    )}