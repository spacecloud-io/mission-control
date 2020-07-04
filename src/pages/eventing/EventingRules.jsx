import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import { Button, Table, Popconfirm } from "antd";
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'automate-redux'
import { set, get } from 'automate-redux';
import ReactGA from 'react-ga';
import { getProjectConfig, notify, setProjectConfig, getEventSourceFromType } from '../../utils';
import client from '../../client';
import store from '../../store';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import RuleEditor from '../../components/rule-editor/RuleEditor';
import EventSecurityRuleForm from '../../components/eventing/EventSecurityRuleForm';
import securitySvg from '../../assets/security.svg';

const EventingRules = () => {
    const { projectID } = useParams()
  
    useEffect(() => {
      ReactGA.pageview("/projects/eventing/rules");
    }, [])

    // Global state
    const projects = useSelector(state => state.projects)
    const selectedEvent = useSelector(state => state.uiState.selectedEvent)
    const [addRuleModalVisible, setAddRuleModalVisible] = useState(false)
    const [conformLoading, setConformLoading] = useState(false);
    const dispatch = useDispatch()
  
    // Derived properties
    const rule = getProjectConfig(projects, projectID, `modules.eventing.securityRules.default`, {})
    delete rule.id;
    const rules = getProjectConfig(projects, projectID, `modules.eventing.securityRules`, {})
    const eventRules = getProjectConfig(projects, projectID, `modules.eventing.triggers`, {})
    const customEventTypes = Object.entries(eventRules).filter(([key, value]) => getEventSourceFromType(value.type) === "custom").map(([_, value]) => value.type)
    
    // Handlers
    useEffect(() => {
      const bc = new BroadcastChannel('builder');
      bc.onmessage = ({data}) => {
        if (data.module === 'eventing') {
          store.dispatch(increment("pendingRequests"))
          client.eventing.setSecurityRule(projectID, data.name, data.rules[data.name]).then(() => {
            setProjectConfig(projectID, `modules.eventing.securityRules.${data.name}`, data.rules[data.name])
            notify("success", "Success", "Saved event rule successfully")
          })
          .catch(ex => {
            notify("error", "Error saving event rule", ex)
          })
          .finally(() => store.dispatch(decrement("pendingRequests")) )
        }
      }
    }, [])
    
    const handleSelect = (eventType) => dispatch(set("uiState.selectedEvent", eventType))
  
    const handleSubmit = (type, rule) => {
      return new Promise((resolve, reject) => {
        setConformLoading(true)
        store.dispatch(increment("pendingRequests"))
        client.eventing.setSecurityRule(projectID, type, rule).then(() => {
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
        client.eventing.deleteSecurityRule(projectID, type).then(() => {
          let newRules = Object.assign({}, getProjectConfig(store.getState().projects, projectID, `modules.eventing.securityRules`, {}))
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

    const handleSecureClick = id => {
      const rule = getProjectConfig(projects, projectID, `modules.eventing.securityRules.${id}`);
      const w = window.open(`/mission-control/projects/${projectID}/security-rules/editor?moduleName=eventing&name=${id}`, '_newtab')
      w.data = {
        rules: {
          [id]: {
            ...rule
         }
        }
      };
    }
   
    const EmptyState = () => {
      return <div style={{ marginTop: 24 }}>
        <div className="panel">
          <img src={securitySvg} width="240px" />
    <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Secruity rules helps you restrict access to your data.</p>
        </div>
      </div>
    }

    const columns = [
      {
        title: "Event type",
        dataIndex: "type",
        key: "type"
      },
      {
        title: "Actions",
        key: "actions",
        className: "column-actions",
        render: (_, record) => (
          <span>
            <a onClick={() => handleSecureClick(record.type)}>Secure</a>
            <Popconfirm title={`Are you sure you want to delete this rule?`} onConfirm={() => handleDeleteRule(record.type)}>
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </span>
        )
      }
    ]

    return (
        <div>
            <Topbar showProjectSelector />
            <Sidenav selectedItem="eventing" />
            <div className='page-content page-content--no-padding'>
                <EventTabs activeKey="rules" projectID={projectID} />
            <div className="event-tab-content"> 
                <h3 style={{ display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
                {Object.keys(rules).length > 0 ? <Table dataSource={Object.keys(rules).map(val => ({type: val}))} columns={columns}/> : <EmptyState />}
                {/* <RuleEditor rules={rules}
                    selectedRuleName={selectedEvent}
                    handleSelect={handleSelect}
                    handleSubmit={(rule) => handleSubmit(selectedEvent, rule)}
                    canDeleteRules
                    handleDelete={handleDeleteRule}
                    emptyState={<EmptyState />} 
                /> */}
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

export default EventingRules;