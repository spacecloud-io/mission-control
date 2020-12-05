import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import { Button, Empty, Input, Table, Popconfirm } from "antd";
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import { notify, getEventSourceFromType, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { useSelector } from "react-redux";
import EventSchemaForm from "../../components/eventing/EventSchemaForm";
import dataModellingSvg from "../../assets/data-modelling.svg";
import { deleteEventingSchema, saveEventingSchema, loadEventingSchemas, getEventingSchemas, getEventingTriggerRules } from "../../operations/eventing";
import { projectModules, actionQueuedMessage } from "../../constants";
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

const EventingSchema = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadEventingSchemas(projectID)
        .catch(ex => notify("error", "Error fetching eventing schemas", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  // Global state
  const eventRules = useSelector(state => getEventingTriggerRules(state))
  const schemas = useSelector(state => getEventingSchemas(state))

  // Component state
  const [addColModalVisible, setAddColModalVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState();
  const [searchText, setSearchText] = useState('')

  // Derived state
  const customEventTypes = Object.entries(eventRules)
    .filter(([key, value]) => getEventSourceFromType(value.type) === "custom")
    .map(([_, value]) => value.type);
  const schemasTableData = Object.keys(schemas).map(val => ({ type: val }));

  const filteredSchemasData = schemasTableData.filter(rule => {
    return rule.type.toLowerCase().includes(searchText.toLowerCase())
  })

  // Handlers
  const handleCancelAddColModal = () => {
    setAddColModalVisible(false);
    setSelectedSchema();
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

  const handleEditSchema = (type) => {
    setSelectedSchema(type);
    setAddColModalVisible(true);
  }

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

  const columns = [
    {
      title: "Event type",
      dataIndex: "type",
      key: "type",
      render: (value) => {
        return <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      }
    },
    {
      title: "Actions",
      key: "actions",
      className: "column-actions",
      render: (_, record) => (
        <span>
          <a onClick={() => handleEditSchema(record.type)}>Edit</a>
          <Popconfirm title={`Are you sure you want to delete this rule?`} onConfirm={() => handleDelete(record.type)}>
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.EVENTING} />
      <div className="page-content page-content--no-padding">
        <EventTabs activeKey="schema" projectID={projectID} />
        <div className="event-tab-content">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
          <h3 style={{ margin: 'auto 0' }}>Schema {filteredSchemasData.length ? `(${filteredSchemasData.length})` : ''}</h3>
            <div style={{ display: 'flex' }}>
              <Input.Search placeholder='Search by event type' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button style={{ marginLeft: '16px' }} onClick={() => setAddColModalVisible(true)} type="primary">Add</Button>
            </div>
          </div>
          <Table
            dataSource={filteredSchemasData}
            columns={columns}
            locale={{
              emptyText: schemasTableData.length !== 0 ?
                <EmptySearchResults searchText={searchText} /> :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No event schema created yet. Add a event schema' />
            }}
          />
          {addColModalVisible && (
            <EventSchemaForm
              projectId={projectID}
              customEventTypes={customEventTypes}
              handleCancel={() => handleCancelAddColModal(false)}
              handleSubmit={handleAddSchema}
              initialValues={{ eventType: selectedSchema, schema: schemas[selectedSchema] }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventingSchema;
