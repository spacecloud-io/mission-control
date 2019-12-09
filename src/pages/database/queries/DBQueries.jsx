import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';

import { Row, Select } from 'antd';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import QueryWhite from "../../../components/db-query/query-white";
import QueryDark from "../../../components/db-query/query-dark";

import { getProjectConfig } from '../../../utils';

const Queries = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const projects = useSelector(state => state.projects)

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {})
  const rules = Object.entries(collections).filter(([name]) => name !== "event_logs" && name !== "default").reduce((prev, [name, col]) => Object.assign(prev, { [name]: col.schema }), {})

  const entries = Object.entries(rules)

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <DBTabs
            selectedDB={selectedDB}
            projectID={projectID}
            activeKey='queries'
          />
          <div className="db-tab-content">
            <Select defaultValue={"authors"}>
              {entries.map(([ruleName]) => <Select.Option value={ruleName}>{ruleName}</Select.Option>)}
              {console.log(entries)}
            </Select>
            <p className="query-font">Queries</p>
            <p className="query-font-small">Fetch records from posts table with filters and pagination:</p>
            <div>
              <Row gutter={48}>
                <div><QueryWhite /></div>
                <div><QueryDark /></div>
              </Row>
              <p className="query-font">Mutations</p>
              <p className="query-font-small">Insert a new record in posts table:</p>
              <Row gutter={48}>
                <div><QueryWhite /></div>
                <div><QueryDark /></div>
              </Row>
              <p className="query-font-small" style={{ marginTop: 15 }}>Delete a record from posts table:</p>
              <Row gutter={48} style={{ marginBottom: 25}}>
                <div><QueryWhite /></div>
                <div><QueryDark /></div>
              </Row>
              <div />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Queries