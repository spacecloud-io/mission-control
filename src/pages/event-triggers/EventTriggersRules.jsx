import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'automate-redux'
import { set, get } from 'automate-redux';
import { getProjectConfig, notify, setProjectConfig } from '../../utils';
import client from '../../client';
import store from '../../store';
import EventTabs from "../../components/event-triggers/event-tabs/EventTabs";
import RuleEditor from '../../components/rule-editor/RuleEditor';
import AddEventRuleForm from '../../components/event-triggers/AddEventRuleForm';
import securitySvg from '../../assets/security.svg';

const EventTriggersRules = () => {
    const { projectID } = useParams()
  
    // Global state
    const projects = useSelector(state => state.projects)
    const selectedEvent = useSelector(state => state.uiState.selectedEvent)
    const [addRuleModalVisible, setAddRuleModalVisible] = useState(false)
    const [conformLoading, setConformLoading] = useState(false);
    const dispatch = useDispatch()
  
    // Derived properties
    const rule = getProjectConfig(projects, projectID, `modules.eventing.securityRules.default`, {})
    const rules = getProjectConfig(projects, projectID, `modules.eventing.securityRules`, {})
    
    // Handlers
    const handleSelect = (eventType) => dispatch(set("uiState.selectedEvent", eventType))
  
    const handleSubmit = (rule) => {
      return new Promise((resolve, reject) => {
        setConformLoading(true)
        store.dispatch(increment("pendingRequests"))
        client.eventTriggers.setColRule(projectID, selectedEvent, rule).then(() => {
          setProjectConfig(projectID, `modules.eventing.securityRules.${selectedEvent}`, rule)
          notify("success", "Success", "Saved event rule successfully")
          dispatch(set("uiState.selectedEvent", selectedEvent))
          setAddRuleModalVisible(false);
          setConformLoading(false);
          resolve()
        })
          .catch(ex => {
              notify("error", "Error saving event rule", ex)
              setConformLoading(false);
              reject(ex)
          })
          .finally(() => store.dispatch(decrement("pendingRequests")) )
      })
    }
  
    
    const handleDeleteRule = (type) => {
      return new Promise((resolve, reject) => {
        store.dispatch(increment("pendingRequests"))
        client.eventTriggers.deleteColRule(projectID, type).then(() => {
          const newRule = getProjectConfig(store.getState().projects, projectID, `modules.eventing.securityRules`, {})
          delete newRule[type]
          setProjectConfig(projectID, `modules.eventing.securityRules`, newRule)
          notify("success", "Success", "Removed event rule successfully")
          resolve()
        })
          .catch(ex => {
            notify("error", "Error removing event rule", ex.toString())
            reject(ex)
          })
          .finally(() => store.dispatch(decrement("pendingRequests")))
      })
    }
  
    const addDbRule = (type, rule) => {
      return new Promise((resolve, reject) => {
        setConformLoading(true)
        store.dispatch(increment("pendingRequests"))
        client.eventTriggers.setColRule(projectID, type, rule).then(() => {
          setProjectConfig(projectID, `modules.eventing.securityRules.${type}`, rule)
          notify("success", "Success", "Saved rule successfully")
          dispatch(set("uiState.selectedEvent", type))
          setAddRuleModalVisible(false);
          setConformLoading(false);
          resolve()
        })
          .catch(ex => {
              notify("error", "Error saving rule", ex)
              setConformLoading(false);
              reject(ex)
          })
          .finally(() => store.dispatch(decrement("pendingRequests")) )
      })
    }
  
    const EmptyState = () => {
      return <div style={{ marginTop: 24 }}>
        <div className="panel">
          <img src={securitySvg} width="240px" />
          <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Secruity rules helps you restrict access to your data <a href="https://docs.spaceuptech.com/auth/authorization">View Docs.</a></p>
        </div>
      </div>
    }

    return (
        <div>
            <Topbar showProjectSelector />
            <Sidenav selectedItem="event-triggers" />
            <div className='page-content page-content--no-padding'>
                <EventTabs activeKey="rules" projectID={projectID} />
            <div className="event-tab-content"> 
                <h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
                <RuleEditor rules={rules}
                    selectedRuleName={selectedEvent}
                    handleSelect={handleSelect}
                    handleSubmit={handleSubmit}
                    canDeleteRules
                    handleDelete={handleDeleteRule}
                    emptyState={<EmptyState />}
                />
                {addRuleModalVisible && <AddEventRuleForm
                    defaultRules={rule}
                    handleSubmit={addDbRule}
                    conformLoading={conformLoading}
                    handleCancel={() => setAddRuleModalVisible(false)} />}
            </div>
            </div>
        </div>
    )
}

export default EventTriggersRules;