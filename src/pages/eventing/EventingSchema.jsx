import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import { Button, Input } from "antd";
import ReactGA from 'react-ga';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import { notify, getEventSourceFromType, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { useSelector, useDispatch } from "react-redux";
import { set } from "automate-redux";
import RuleEditor from "../../components/rule-editor/RuleEditor";
import EventSchemaForm from "../../components/eventing/EventSchemaForm";
import dataModellingSvg from "../../assets/data-modelling.svg";
import { deleteEventingSchema, saveEventingSchema, loadEventingSchemas, getEventingSchemas, getEventingTriggerRules } from "../../operations/eventing";
import { projectModules, actionQueuedMessage } from "../../constants";
import Highlighter from 'react-highlight-words';

const EventingSchema = () => {
  // Router params
  const { projectID } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/projects/eventing/schema");
  }, [])

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadEventingSchemas(projectID)
        .catch(ex => notify("error", "Error fetching eventing schemas", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  // Global state
  const selectedEvent = useSelector(state => state.uiState.selectedEvent);
  const eventRules = useSelector(state => getEventingTriggerRules(state))
  const schemas = useSelector(state => getEventingSchemas(state))

  // Component state
  const [addColModalVisible, setAddColModalVisible] = useState(false);
  const [addColFormInEditMode, setAddColFormInEditMode] = useState(false);
  const [searchText, setSearchText] = useState('')

  // Derived state
  const customEventTypes = Object.entries(eventRules)
    .filter(([key, value]) => getEventSourceFromType(value.type) === "custom")
    .map(([_, value]) => value.type);

  // Handlers
  const handleSelect = eventType =>
    dispatch(set("uiState.selectedEvent", eventType));


  const handleCancelAddColModal = () => {
    setAddColModalVisible(false);
    setAddColFormInEditMode(false);
  };

  const handleDelete = type => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      deleteEventingSchema(projectID, type)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Removed event schema successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error removing event schema", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    });
  };

  const handleAddSchema = (type, schema) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveEventingSchema(projectID, type, schema)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved event schema successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving event schema", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    });
  };

  const EmptyState = () => {
    return (
      <div>
        <div className="panel" style={{ margin: 24 }}>
          <img src={dataModellingSvg} width="240px" />
          <p
            className="panel__description"
            style={{ marginTop: 32, marginBottom: 0 }}
          >
            Schema lets you manage types and relations
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.EVENTING} />
      <div className="page-content page-content--no-padding">
        <EventTabs activeKey="schema" projectID={projectID} />
        <div className="event-tab-content">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom:'16px' }}>
            <h3 style={{ margin: 'auto 0' }}>Schema </h3> 
            <div style={{ display: 'flex' }}>
              <Input.Search placeholder='Search by event type' style={{ minWidth:'320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button style={{ marginLeft:'16px' }} onClick={() => setAddColModalVisible(true)} type="primary">Add</Button>
            </div>
          </div>
          <RuleEditor
            rules={schemas}
            selectedRuleName={selectedEvent}
            handleSelect={handleSelect}
            handleSubmit={schema => handleAddSchema(selectedEvent, schema)}
            canDeleteRules
            handleDelete={handleDelete}
            stringifyRules={false}
            emptyState={<EmptyState />}
            searchText={searchText}
          />
          {addColModalVisible && (
            <EventSchemaForm
              editMode={addColFormInEditMode}
              projectId={projectID}
              customEventTypes={customEventTypes}
              handleCancel={() => handleCancelAddColModal(false)}
              handleSubmit={handleAddSchema}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventingSchema;
