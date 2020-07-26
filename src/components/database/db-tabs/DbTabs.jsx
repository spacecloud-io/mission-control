import React from 'react';
import { Tabs } from 'antd';
import { Redirect } from 'react-router-dom';
import "./db-tabs.css"
import { useSelector } from 'react-redux';
import { isPreparedQueriesSupported } from '../../../operations/database';
const { TabPane } = Tabs;

export default ({ activeKey, projectID, selectedDB }) => {
  const showPreparedQueriesTab = useSelector(state => isPreparedQueriesSupported(state, selectedDB))
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
        {showPreparedQueriesTab && <TabPane tab='Prepared queries' key='preparedQueries'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries`
            }}
          />
        </TabPane>}
        <TabPane tab='Browse' key='browse'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/browse`
            }}
          />
        </TabPane>
        <TabPane tab='Sample queries' key='queries'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/queries`
            }}
          />
        </TabPane>
        <TabPane tab='Settings' key='settings'>
          <Redirect
            to={{
              pathname: `/mission-control/projects/${projectID}/database/${selectedDB}/settings`
            }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}