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
  const rules = Object.entries(collections).reduce((prev, [name, col]) => Object.assign(prev, { [name]: col.rules }), {})

  // Handlers
  const handleRuleClick = (ruleName) => dispatch(set("uiState.selectedCollection", ruleName))

  const handleSubmit = (rules) => {
    const isRealtimeEnabled = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.${selectedCol}.isRealtimeEnabled`)
    setColRule(projectID, selectedDB, selectedCol, rules, isRealtimeEnabled)
      .then(() => notify("success", "Success", "Saved rule successfully"))
      .catch(ex => notify("error", "Error saving rule", ex))
  }

  const SidePanel = () => {
    return <div className="side-panel">
      <div className="side-panel__graphic">
        <img src={securitySvg} />
      </div>
      <p className="side-panel__description">Secure who can access what</p>
      <a target="_blank" href="https://docs.spaceuptech.com/auth/authorization" className="side-panel__link"><span>View docs</span> <i className="material-icons">launch</i></a>
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
            activeKey='rules'
          />
          <div className="db-tab-content">
            <RuleEditor rules={rules}
              selectedRuleName={selectedCol}
              handleClick={handleRuleClick}
              handleSubmit={handleSubmit}
              sidePanel={<SidePanel />} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Rules