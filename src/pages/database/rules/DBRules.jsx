import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { set, increment, decrement } from 'automate-redux';
import ReactGA from 'react-ga'

import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import RuleEditor from "../../../components/rule-editor/RuleEditor"
import securitySvg from "../../../assets/security.svg"

import { getProjectConfig, notify } from '../../../utils';
import { setColRule } from '../dbActions';
import client from "../../../client"
import { Button } from "antd"
import AddDbRuleForm from '../../../components/database/add-rule-form/AddDbRuleForm';
import { defaultDBRules } from '../../../constants';

const Rules = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  useEffect(() => {
    ReactGA.pageview("/projects/database/rules");
  }, [])
  // Global state
  const projects = useSelector(state => state.projects)
  const selectedCol = useSelector(state => state.uiState.selectedCollection)

  const [addRuleModalVisible, setAddRuleModalVisible] = useState(false)
  const [conformLoading, setConformLoading] = useState(false);
  const dispatch = useDispatch()

  // Derived properties
  const collections = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections`, {})
  let rule = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.default.rules`, {})
  if (Object.keys(rule).length === 0) {
    rule = defaultDBRules
  }
  const rules = Object.entries(collections).filter(([name, colValue]) => name !== "event_logs" && Object.keys(colValue.rules).length > 0).reduce((prev, [name, col]) => Object.assign(prev, { [name]: col.rules }), {})
  // Handlers
  const handleSelect = (colName) => dispatch(set("uiState.selectedCollection", colName))

  const handleSubmit = (rules) => {
    const isRealtimeEnabled = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.${selectedCol}.isRealtimeEnabled`)
    setColRule(projectID, selectedDB, selectedCol, rules, isRealtimeEnabled, true)
      .then(() => notify("success", "Success", "Saved rule successfully"))
      .catch(ex => notify("error", "Error saving rule", ex))
  }

  const handleDeleteRule = () => {
    const isRealtimeEnabled = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.${selectedCol}.isRealtimeEnabled`)
    dispatch(increment("pendingRequests"))
    setColRule(projectID, selectedDB, selectedCol, {}, isRealtimeEnabled, true)
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const addDbRule = (name, rule) => {
    setConformLoading(true)
    const isRealtimeEnabled = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.collections.${selectedCol}.isRealtimeEnabled`)
    dispatch(increment("pendingRequests"))
    setColRule(projectID, selectedDB, name, rule, isRealtimeEnabled, true)
      .then(() => {
        notify("success", "Success", "Saved rule successfully")
        setAddRuleModalVisible(false);
        setConformLoading(false);
        dispatch(set("uiState.selectedCollection", name))
      })
      .catch(ex => {
        notify("error", "Error saving rule", ex)
        setConformLoading(false);
      })
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const EmptyState = () => {
    return <div style={{ marginTop: 24 }}>
      <div className="panel">
        <img src={securitySvg} width="240px" />
        <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Security rules helps you restrict access to your data <a href="https://docs.spaceuptech.com/storage/database/securing-apis">View Docs.</a></p>
      </div>
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
            <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
            <RuleEditor rules={rules}
              selectedRuleName={selectedCol}
              handleSelect={handleSelect}
              handleSubmit={handleSubmit}
              canDeleteRules
              handleDelete={handleDeleteRule}
              emptyState={<EmptyState />}
            />
          </div>
          {addRuleModalVisible && <AddDbRuleForm
            defaultRules={rule}
            handleSubmit={addDbRule}
            conformLoading={conformLoading}
            handleCancel={() => setAddRuleModalVisible(false)} />}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Rules