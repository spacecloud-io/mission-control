import React from 'react';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { set } from 'automate-redux';

import { Alert } from "antd"
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import RuleEditor from "../../../components/rule-editor/RuleEditor"
import dataModellingSvg from "../../../assets/data-modelling.svg"

import { getProjectConfig, notify } from '../../../utils';
import { modifyColSchema } from '../dbActions';

const Schema = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const projects = useSelector(state => state.projects)
  const selectedCol = useSelector(state => state.uiState.selectedCollection)

  const dispatch = useDispatch()

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {})
  const schemas = Object.entries(collections).filter(([name]) => name !== "event_logs" && name !== "default").reduce((prev, [name, col]) => Object.assign(prev, { [name]: col.schema }), {})

  // Handlers
  const handleSelect = (colName) => dispatch(set("uiState.selectedCollection", colName))

  const handleSubmit = (schema) => {
    modifyColSchema(projectID, selectedDB, selectedCol, schema)
      .then(() => notify("success", "Success", "Saved schema successfully"))
      .catch(ex => notify("error", "Error saving schema", ex))
  }

  const SidePanel = () => {
    return <div className="panel panel--has-border-right">
      <div className="panel__graphic">
        <img src={dataModellingSvg} width="70%" />
      </div>
      <p className="panel__description" style={{ marginTop: 16, marginBottom: 0 }}>Schema lets you manage types and relations</p>
      <a style={{ marginTop: 4 }} target="_blank" href="https://docs.spaceuptech.com/essentials/data-modelling" className="panel__link"><span>View docs</span> <i className="material-icons">launch</i></a>
    </div>
  }

  const EmptyState = () => {
    return <div>
      <div className="panel" style={{ margin: 24 }}>
        <img src={dataModellingSvg} width="240px" />
        <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Schema lets you manage types and relations</p>
        <a style={{ marginTop: 4 }} target="_blank" href="https://docs.spaceuptech.com/essentials/data-modelling" className="panel__link"><span>View docs</span> <i className="material-icons">launch</i></a>
      </div>
      <Alert message={`You first need to add a ${selectedDB === "mongo" ? "collection" : "table"}`} type="info" banner showIcon={false} style={{ textAlign: "center" }} />
    </div>
  }
  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div className='flex-box'>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--has-tabs'>
          <DBTabs
            selectedDB={selectedDB}
            projectID={projectID}
            activeKey='schema'
          />
          <div className="db-tab-content">
            <RuleEditor rules={schemas}
              selectedRuleName={selectedCol}
              handleSelect={handleSelect}
              handleSubmit={handleSubmit}
              stringifyRules={false}
              emptyState={<EmptyState />}
              sidePanel={<SidePanel />} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Schema