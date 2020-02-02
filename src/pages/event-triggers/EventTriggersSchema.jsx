import React, { useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import { Button } from "antd"
import EventTabs from "../../components/event-triggers/event-tabs/EventTabs";
import { getProjectConfig, notify, setProjectConfig } from '../../utils';
import { useSelector, useDispatch } from 'react-redux';
import { set, get, increment, decrement } from 'automate-redux';
import store from '../../store';
import client from '../../client';
import RuleEditor from "../../components/rule-editor/RuleEditor";
import AddEventSchemaForm from '../../components/event-triggers/AddEventSchemaForm'
import dataModellingSvg from "../../assets/data-modelling.svg";

const EventTriggersSchema = () => {
    // Router params
    const { projectID, selectedDB } = useParams()

    // Global state
    const projects = useSelector(state => state.projects)
    const selectedEvent = useSelector(state => state.uiState.selectedEvent)

    const dispatch = useDispatch()

    // Derived properties
    const schemas = getProjectConfig(projects, projectID, `modules.eventing.schema`, {});

    // Handlers
    const handleSelect = (eventType) => dispatch(set("uiState.selectedEvent", eventType))

    const handleSubmit = (schema) => {
      return new Promise((resolve, reject) => {
        setConformLoading(true)
        store.dispatch(increment("pendingRequests"))
        client.eventTriggers.setEventSchema(projectID, selectedEvent, schema).then(() => {
          setProjectConfig(projectID, `modules.eventung.rules.${selectedEvent}.schema`, schema)
          notify("success", "Success", "Saved schema successfully")
          dispatch(set("uiState.selectedEvent", selectedEvent))
          setAddColModalVisible(false);
          setConformLoading(false);
          resolve()
        })
          .catch(ex => {
              notify("error", "Error saving schema", ex)
              setConformLoading(false);
              reject(ex)
          })
          .finally(() => store.dispatch(decrement("pendingRequests")) )
      })
    }

    // Component state
    const [addColModalVisible, setAddColModalVisible] = useState(false);
    const [addColFormInEditMode, setAddColFormInEditMode] = useState(false);
    // making changes for loading button
    const [conformLoading, setConformLoading] = useState(false);
    
    // Derived properties
      const handleAddClick = () => {
        setAddColFormInEditMode(false)
        setAddColModalVisible(true)
      }
    
      const handleCancelAddColModal = () => {
        setAddColModalVisible(false)
        setAddColFormInEditMode(false)
      }
    
      const handleDelete = (type) => {
        return new Promise((resolve, reject) => {
          store.dispatch(increment("pendingRequests"))
          client.eventTriggers.deleteColRule(projectID, type).then(() => {
            const newSchema = getProjectConfig(store.getState().projects, projectID, `modules.eventing.schema`, {})
            delete newSchema[type]
            setProjectConfig(projectID, `modules.eventing.schema`, newSchema)
            resolve()
            notify("success", "Success", "Removed event schema successfully")
          })
            .catch(ex => {
              reject(ex)
              notify("error", "Error removing event schema", ex)
            })
            .finally(() => store.dispatch(decrement("pendingRequests")))
        })
      }
    
      const handleAddSchema = (type, schema) => {
        return new Promise((resolve, reject) => {
          setConformLoading(true)
          store.dispatch(increment("pendingRequests"))
          client.eventTriggers.setEventSchema(projectID, type, schema).then(() => {
            setProjectConfig(projectID, `modules.eventing.schema.${type}`, schema)
            notify("success", "Success", "Saved event schema successfully")
            dispatch(set("uiState.selectedEvent", type))
            setAddColModalVisible(false);
            setConformLoading(false);
            resolve()
          })
            .catch(ex => {
                notify("error", "Error saving event schema", ex)
                setConformLoading(false);
                reject(ex)
            })
            .finally(() => store.dispatch(decrement("pendingRequests")) )
        })
      }

    const EmptyState = () => {
        return <div>
        <div className="panel" style={{ margin: 24 }}>
            <img src={dataModellingSvg} width="240px" />
            <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Schema lets you manage types and relations</p>
            <a style={{ marginTop: 4 }} target="_blank" href="https://docs.spaceuptech.com/essentials/data-modelling" className="panel__link"><span>View docs</span> <i className="material-icons">launch</i></a>
        </div>
        </div>
    }

    return (
        <div>
            <Topbar showProjectSelector />
            <Sidenav selectedItem="event-triggers" />
            <div className='page-content page-content--no-padding'>
                <EventTabs activeKey="schema" projectID={projectID} />
            <div className="event-tab-content">
                <h3 style={{ display: "flex", justifyContent: "space-between" }}>Schema<Button type="primary" onClick={() => setAddColModalVisible(true)}>Add</Button></h3>
                <RuleEditor rules={schemas}
                selectedRuleName={selectedEvent}
                handleSelect={handleSelect}
                handleSubmit={handleSubmit}
                canDeleteRules
                handleDelete={handleDelete}
                stringifyRules={false}
                emptyState={<EmptyState />}/>
                {addColModalVisible && <AddEventSchemaForm
                editMode={addColFormInEditMode}
                projectId={projectID}
                selectedDB={selectedDB}
                conformLoading={conformLoading}
                handleCancel={() => handleCancelAddColModal(false)}
                handleSubmit={handleAddSchema}
                />}
            </div>
            </div>
        </div>
    )
}

export default EventTriggersSchema;