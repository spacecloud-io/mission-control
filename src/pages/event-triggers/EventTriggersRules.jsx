import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'automate-redux'
import { set, get } from 'automate-redux';
import { getProjectConfig, notify, setProjectConfig, getEventSourceFromType } from '../../utils';
import client from '../../client';
import store from '../../store';
import EventTabs from "../../components/event-triggers/event-tabs/EventTabs";
import RuleEditor from '../../components/rule-editor/RuleEditor';
import EventSecurityRuleForm from '../../components/event-triggers/EventSecurityRuleForm';
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
    const rule = getProjectConfig(projectID, `modules.eventing.securityRules.default`, {})
    const rules = getProjectConfig(projectID, `modules.eventing.securityRules`, {})
    const eventRules = getProjectConfig(projectID, `modules.eventing.rules`, {})
    const customEventTypes = Object.entries(eventRules).filter(([key, value]) => getEventSourceFromType(value.type) === "custom").map(([_, value]) => value.type)
    
    // Handlers
    const handleSelect = (eventType) => dispatch(set("uiState.selectedEvent", eventType))
  
    const handleSubmit = (type, rule) => {
      return new Promise((resolve, reject) => {
        setConformLoading(true)
        store.dispatch(increment("pendingRequests"))
        client.eventTriggers.setSecurityRule(projectID, type, rule).then(() => {
          setProjectConfig(projectID, `modules.eventing.securityRules.${type}`, rule)
          notify("success", "Success", "Saved event rule successfully")
          dispatch(set("uiState.selectedEvent", type))
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
        client.eventTriggers.deleteSecurityRule(projectID, type).then(() => {
          let newRules = Object.assign({}, getProjectConfig(projectID, `modules.eventing.securityRules`, {}))
          delete newRules[type]
          setProjectConfig(projectID, `modules.eventing.securityRules`, newRules)
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
                <h3 style={{ display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
                <RuleEditor rules={rules}
                    selectedRuleName={selectedEvent}
                    handleSelect={handleSelect}
                    handleSubmit={(rule) => handleSubmit(selectedEvent, rule)}
                    canDeleteRules
                    handleDelete={handleDeleteRule}
                    emptyState={<EmptyState />}
                />
                {addRuleModalVisible && <EventSecurityRuleForm
                    defaultRules={rule}
                    handleSubmit={handleSubmit}
                    conformLoading={conformLoading}
                    customEventTypes={customEventTypes}
                    handleCancel={() => setAddRuleModalVisible(false)} />}
            </div>
            </div>
        </div>
    )
}

export default EventTriggersRules;