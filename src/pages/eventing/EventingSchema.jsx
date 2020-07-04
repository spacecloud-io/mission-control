import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import ReactGA from 'react-ga';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import {
  getProjectConfig,
  notify,
  setProjectConfig,
  getEventSourceFromType,
  incrementPendingRequests,
  decrementPendingRequests
} from "../../utils";
import { useSelector, useDispatch } from "react-redux";
import { set, get, increment, decrement } from "automate-redux";
import store from "../../store";
import client from "../../client";
import RuleEditor from "../../components/rule-editor/RuleEditor";
import EventSchemaForm from "../../components/eventing/EventSchemaForm";
import dataModellingSvg from "../../assets/data-modelling.svg";
import { deleteEventingSchema, setEventingSchema } from "../../operations/eventing";

const EventingSchema = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/eventing/schema");
  }, [])

  // Global state
  const projects = useSelector(state => state.projects);
  const selectedEvent = useSelector(state => state.uiState.selectedEvent);
  const eventRules = getProjectConfig(
    projects,
    projectID,
    `modules.eventing.triggers`,
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
      incrementPendingRequests()
      deleteEventingSchema(projectID, type)
        .then(() => {
          notify("success", "Success", "Removed event schema successfully")
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
      setEventingSchema(projectID, type, schema)
        .then(() => {
          notify("success", "Success", "Saved event schema successfully")
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
          {/* <a
            style={{ marginTop: 4 }}
            target="_blank"
            href="https://docs.spaceuptech.com/essentials/storage/database/data-modelling"
            className="panel__link"
          >
            <span>View docs</span> <i className="material-icons">launch</i>
          </a> */}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="eventing" />
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

export default EventingSchema;
