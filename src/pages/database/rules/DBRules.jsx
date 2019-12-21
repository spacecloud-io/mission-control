import React from 'react';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { set } from 'automate-redux';

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import RuleEditor from "../../../components/rule-editor/RuleEditor"
import securitySvg from "../../../assets/security.svg"

import { getProjectConfig, notify } from '../../../utils';
import { setColRule } from '../dbActions';

const Rules = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const projects = useSelector(state => state.projects)
  const selectedCol = useSelector(state => state.uiState.selectedCollection)

  const dispatch = useDispatch()

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {})
  const rules = Object.entries(collections).filter(([name]) => name !== "event_logs").reduce((prev, [name, col]) => Object.assign(prev, { [name]: col.rules }), {})

  // Handlers
  const handleSelect = (colName) => dispatch(set("uiState.selectedCollection", colName))

  const handleSubmit = (rules) => {
    const isRealtimeEnabled = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.${selectedCol}.isRealtimeEnabled`)
    setColRule(projectID, selectedDB, selectedCol, rules, isRealtimeEnabled, true)
      .then(() => notify("success", "Success", "Saved rule successfully"))
      .catch(ex => notify("error", "Error saving rule", ex))
  }

  const SidePanel = () => {
    return <div className="panel panel--has-border-right">
      <div className="panel__graphic">
        <img src={securitySvg} width="70%" />
      </div>
      <p className="panel__description" style={{ marginTop: 16, marginBottom: 0 }}>Secure who can access what</p>
      <a style={{ marginTop: 4 }} target="_blank" href="https://docs.spaceuptech.com/auth/authorization" className="panel__link"><span>View docs</span> <i className="material-icons">launch</i></a>
    </div>
  }
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
            activeKey='rules'
          />
          <div className="db-tab-content">
            <RuleEditor rules={rules}
              selectedRuleName={selectedCol}
              handleSelect={handleSelect}
              handleSubmit={handleSubmit}
              sidePanel={<SidePanel />} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Rules