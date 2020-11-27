import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { set, increment, decrement } from "automate-redux";

import { CheckOutlined, CloseOutlined, FilterOutlined, HourglassOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Table, Row, Col, Alert, Typography } from "antd";
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import FilterForm from "../../components/eventing/FilterForm";
import InfiniteScrollingTable from "../../components/utils/infinite-scrolling-table/InfiniteScrollingTable";
import JSONView from "../../components/utils/json-view/JSONView";


import client from "../../client";
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { getEventingDbAliasName, getEventingConfig } from '../../operations/eventing';
import store from '../../store';

import '../../index.css';
import './event.css';
import { projectModules } from '../../constants';
import { getAPIToken } from '../../operations/projects';

const getIconByStatus = (status) => {
  switch (status) {
    case "processed":
      return <CheckOutlined style={{ color: "#00FF00" }} />;
    case "failed":
      return <CloseOutlined style={{ color: "red" }} />;
    default:
      return <HourglassOutlined />;
  }
}

const columns = [
  { title: 'Event ID', dataIndex: '_id', key: '_id' },
  { title: 'Trigger name', dataIndex: 'rule_name', key: 'rule_name' },
  { title: 'Invocations', key: 'invocations', render: record => <p>{record.invocation_logs.length}</p> },
  { title: 'Status', key: 'status', render: record => getIconByStatus(record.status) },
  { title: 'Created at', key: 'date', render: (record) => <p>{record.event_ts}</p> },
];

const EventingLogs = () => {
  // Router params
  const { projectID } = useParams()

  const dispatch = useDispatch();

  // Global state
  const eventLogs = useSelector(state => state.eventLogs);
  const eventFilters = useSelector(state => state.uiState.eventFilters);
  const projects = useSelector(state => state.projects);
  const internalToken = useSelector(state => getAPIToken(state))
  const eventingConfig = useSelector(state => getEventingConfig(state))

  // Component state  
  const [modalVisible, setModalVisible] = useState(false);
  const [hasMoreEventLogs, setHasMoreEventLogs] = useState(true);

  // Derived state
  const eventingConfigured = eventingConfig.enabled && eventingConfig.dbAlias

  useEffect(() => {
    if (projects.length > 0) {
      const dbType = eventingConfig.dbAlias
      if (eventingConfigured) {
        incrementPendingRequests()
        client.eventing.fetchEventLogs(projectID, eventFilters, new Date().toISOString(), dbType, () => internalToken)
          .then(res => dispatch(set("eventLogs", res)))
          .catch(ex => notify("error", "Error loading event logs", ex.toString()))
          .finally(() => decrementPendingRequests())
      }
    }
  }, [eventFilters, projects, eventingConfigured])

  // Handlers

  const filterTable = (values) => {
    dispatch(set("uiState.eventFilters", values))
    setHasMoreEventLogs(true);
  }

  const loadNext = (previousData = []) => {
    return new Promise((resolve, reject) => {
      if (projects.length > 0) {
        const dbType = getEventingDbAliasName(store.getState())
        client.eventing.fetchEventLogs(projectID, eventFilters, previousData.length > 0 ? previousData[previousData.length - 1].event_ts : new Date().toISOString(), dbType, () => internalToken)
          .then(res => {
            if (res.length < 100) {
              setHasMoreEventLogs(false);
            }
            const eventLogsIDMap = [...new Set(eventLogs.map(obj => obj._id))].reduce((prev, curr) => Object.assign({}, prev, { [curr]: true }), {})
            dispatch(set("eventLogs", eventLogs.concat(res.filter(obj => !eventLogsIDMap[obj._id]))))
            resolve()
          })
          .catch(ex => {
            notify("error", "Error loading event logs", ex.toString())
            reject()
          })
      } else {
        resolve()
      }
    })
  }

  const handleRefresh = () => {
    const dbType = getEventingDbAliasName(store.getState())
    dispatch(increment("pendingRequests"));
    client.eventing.fetchEventLogs(projectID, eventFilters, new Date().toISOString(), dbType, () => internalToken)
      .then(res => dispatch(set("eventLogs", res)))
      .catch(ex => notify("error", "Error refreshing event logs", ex.toString()))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const expandedInvocations = record => {
    return (
      <div>
        {record.request_payload && (
          <React.Fragment>
            <Typography.Paragraph strong>Request payload</Typography.Paragraph>
            <JSONView data={record.request_payload} parse /><br /><br />
          </React.Fragment>
        )}
        <Typography.Paragraph strong>Status code</Typography.Paragraph>
        {record.response_status_code}<br /><br />
        {record.response_body && (
          <React.Fragment>
            <Typography.Paragraph strong>Response body</Typography.Paragraph>
            <JSONView data={record.response_body} parse /><br /><br />
          </React.Fragment>
        )}
        {record.error_msg && (
          <React.Fragment>
            <Typography.Paragraph strong>Error message</Typography.Paragraph>
            <Typography.Paragraph>{record.error_msg}</Typography.Paragraph><br /><br />
          </React.Fragment>
        )}
      </div>
    )
  }

  const expandedRowRender = record => {
    const columns = [
      {
        title: 'Status', key: 'status', render: record => {
          if (!record.error_msg) return <CheckOutlined style={{ color: "#00FF00" }} />;
          else return <CloseOutlined style={{ color: "red" }} />;
        }
      },
      { title: 'ID', dataIndex: '_id', key: '_id' },
      { title: 'Date', key: "invocation", render: (record) => <p>{record.invocation_time}</p> }
    ];

    return (
      <Table
        showHeader={false}
        columns={columns}
        dataSource={record.invocation_logs}
        pagination={false}
        expandedRowRender={expandedInvocations}
        rowKey="_id"
        title={() => 'Invocations'}
      />);
  }

  const alertMsg = <div>
    <span>Head over to the </span>
    <Link to={`/mission-control/projects/${projectID}/eventing/settings`}>Eventing Settings tab</Link>
    <span> to configure eventing.</span>
  </div>

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.EVENTING} />
      <div className='page-content page-content--no-padding'>
        <EventTabs activeKey="event-logs" projectID={projectID} />
        <div className="event-tab-content">
          {!eventingConfigured && (<Row>
            <Col lg={{ span: 18, offset: 3 }}>
              <Alert
                message={`Eventing needs to be configured${eventingConfig.enabled ? " properly" : ""}`}
                description={alertMsg}
                type="info"
                showIcon
              />
            </Col>
          </Row>)}
          {
            eventingConfigured && (
              <React.Fragment>
                <Button size="large" style={{ marginRight: 16 }} onClick={handleRefresh}>Refresh <ReloadOutlined /></Button>
                <Button size="large" onClick={() => setModalVisible(true)}>Filters <FilterOutlined /></Button>
                <InfiniteScrollingTable
                  id="event-logs-table"
                  hasMore={hasMoreEventLogs}
                  scrollHeight={600}
                  loadNext={loadNext}
                  className="event-logs-table"
                  columns={columns}
                  dataSource={eventLogs}
                  expandedRowRender={expandedRowRender}
                  bordered
                  rowKey="_id" />
              </React.Fragment>
            )
          }
        </div>
      </div>
      {modalVisible && (
        <FilterForm
          projectID={projectID}
          visible={modalVisible}
          filterTable={filterTable}
          handleCancel={() => { setModalVisible(false); setHasMoreEventLogs(false) }}
          projectID={projectID}
        />
      )}
    </div>
  );
}

export default EventingLogs;
