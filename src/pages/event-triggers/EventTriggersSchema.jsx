import React, { useState } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import EventTabs from "../../components/event-triggers/event-tabs/EventTabs";
import {
  getProjectConfig,
  notify,
  setProjectConfig,
  getEventSourceFromType
} from "../../utils";
import { useSelector, useDispatch } from "react-redux";
import { set, get, increment, decrement } from "automate-redux";
import store from "../../store";
import client from "../../client";
import RuleEditor from "../../components/rule-editor/RuleEditor";
import EventSchemaForm from "../../components/event-triggers/EventSchemaForm";
import dataModellingSvg from "../../assets/data-modelling.svg";

const EventTriggersSchema = () => {
  // Router params
  const { projectID, selectedDB } = useParams();

  // Global state
  const projects = useSelector(state => state.projects);
  const selectedEvent = useSelector(state => state.uiState.selectedEvent);
  const eventRules = getProjectConfig(
    projects,
    projectID,
    `modules.eventing.rules`,
    {}
  );

  const customEventTypes = Object.entries(eventRules)
    .filter(([key, value]) => getEventSourceFromType(value.type) === "custom")
    .map(([_, value]) => value.type);

  const dispatch = useDispatch();

  // Derived properties
  const schemas = Object.entries(
    getProjectConfig(projects, projectID, `modules.eventing.schemas`, {})
  ).reduce(
    (prev, [key, value]) => Object.assign({}, prev, { [key]: value.schema }),
    {}
  );

  // Handlers
  const handleSelect = eventType =>
    dispatch(set("uiState.selectedEvent", eventType));

  // Component state
  const [addColModalVisible, setAddColModalVisible] = useState(false);
  const [addColFormInEditMode, setAddColFormInEditMode] = useState(false);
  // making changes for loading button
  const [conformLoading, setConformLoading] = useState(false);

  const handleCancelAddColModal = () => {
    setAddColModalVisible(false);
    setAddColFormInEditMode(false);
  };

  const handleDelete = type => {
    return new Promise((resolve, reject) => {
      store.dispatch(increment("pendingRequests"));
      client.eventTriggers
        .deleteEventSchema(projectID, type)
        .then(() => {
          const newSchema = getProjectConfig(
            store.getState().projects,
            projectID,
            `modules.eventing.schemas`,
            {}
          );
          delete newSchema[type];
          setProjectConfig(projectID, `modules.eventing.schemas`, newSchema);
          resolve();
          notify("success", "Success", "Removed event schema successfully");
        })
        .catch(ex => {
          reject(ex);
          notify("error", "Error removing event schema", ex);
        })
        .finally(() => store.dispatch(decrement("pendingRequests")));
    });
  };

  const handleAddSchema = (type, schema) => {
    return new Promise((resolve, reject) => {
      setConformLoading(true);
      store.dispatch(increment("pendingRequests"));
      client.eventTriggers
        .setEventSchema(projectID, type, schema)
        .then(() => {
          const oldSchemas = getProjectConfig(projects, projectID, `modules.eventing.schemas`, {})
          const newSchemas = Object.assign({}, oldSchemas, {
            [type]: { schema: schema }
          });
          setProjectConfig(projectID, `modules.eventing.schemas`, newSchemas);

          notify("success", "Success", "Saved event schema successfully");
          dispatch(set("uiState.selectedEvent", type));
          setAddColModalVisible(false);
          setConformLoading(false);
          resolve();
        })
        .catch(ex => {
          notify("error", "Error saving event schema", ex);
          setConformLoading(false);
          reject(ex);
        })
        .finally(() => store.dispatch(decrement("pendingRequests")));
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
          <a
            style={{ marginTop: 4 }}
            target="_blank"
            href="https://docs.spaceuptech.com/essentials/data-modelling"
            className="panel__link"
          >
            <span>View docs</span> <i className="material-icons">launch</i>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="event-triggers" />
      <div className="page-content page-content--no-padding">
        <EventTabs activeKey="schema" projectID={projectID} />
        <div className="event-tab-content">
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>
            Schema
            <Button type="primary" onClick={() => setAddColModalVisible(true)}>
              Add
            </Button>
          </h3>
          <RuleEditor
            rules={schemas}
            selectedRuleName={selectedEvent}
            handleSelect={handleSelect}
            handleSubmit={schema => handleAddSchema(selectedEvent, schema)}
            canDeleteRules
            handleDelete={handleDelete}
            stringifyRules={false}
            emptyState={<EmptyState />}
          />
          {addColModalVisible && (
            <EventSchemaForm
              editMode={addColFormInEditMode}
              projectId={projectID}
              customEventTypes={customEventTypes}
              selectedDB={selectedDB}
              conformLoading={conformLoading}
              handleCancel={() => handleCancelAddColModal(false)}
              handleSubmit={handleAddSchema}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventTriggersSchema;
