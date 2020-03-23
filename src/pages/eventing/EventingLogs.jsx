import React, { useState, useEffect } from 'react';
import {useParams} from "react-router-dom";
import {Button, Icon, Table} from "antd";
import '../../index.css';
import client from "../../client";
import {getProjectConfig, notify} from "../../utils";
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import FilterForm from "../../components/eventing/FilterForm";
import './event.css';
//redux
import {useDispatch, useSelector} from "react-redux";
import {set, increment, decrement} from "automate-redux";
import InfiniteScroll from 'react-infinite-scroller';

const getIconByStatus = (status) => {
  switch(status){
    case "processed":
      return <Icon type="check" style={{color: "#00FF00"}}/>
    case "failed":
      return <Icon type="close" style={{color: "red"}}/>
    default:
      return <Icon type="hourglass" />
  }
}

function parseJSONSafely(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

const columns = [
  { title: 'Event ID', dataIndex: '_id', key: '_id' },
  { title: 'Trigger name', dataIndex: 'rule_name', key: 'rule_name' },
  { title: 'Invocations', key: 'invocations', render: record => <p>{record.invocation_logs.length}</p> },
  { title: 'Status', key: 'status', render: record => getIconByStatus(record.status) },
  { title: 'Created at', key: 'date', render:(record) => <p>{new Date(record.event_timestamp).toISOString()}</p> },
];

const EventingLogs = () => {
  // Router params
  const { projectID } = useParams()
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const eventLogs = useSelector(state => state.eventLogs);
  const eventFilters = useSelector(state => state.uiState.eventFilters);
  const [hasMoreEventLogs, setHasMoreEventLogs] = useState(true);
  const projects = useSelector(state => state.projects);

  useEffect(() => {
    if(projects.length > 0){
      const dbType = getProjectConfig(projects, projectID, "modules.eventing.dbType");
      dispatch(increment("pendingRequests"));
      client.eventing.fetchEventLogs(projectID, eventFilters, 0, dbType)
      .then(res => dispatch(set("eventLogs", res)))
      .catch(ex => notify("error", "Error loading event logs", ex.toString()))
      .finally(() => dispatch(decrement("pendingRequests")))
    }
  }, [eventFilters, projects])
  
  const expandedInvocations = record => {
    return (
      <div>
        {record.request_payload && (
          <>
            <b>Request payload</b><br/>
            <pre>{JSON.stringify(parseJSONSafely(record.request_payload), null, 2)}</pre><br/><br/>
          </>
        )}
        <b>Status Code</b><br/>
        {record.response_status_code}<br/><br/>
        {record.response_body && (
          <>
            <b>Response</b><br/>
            <pre>{JSON.stringify(parseJSONSafely(record.response_body), null, 2)}</pre><br/><br/>
          </>
        )}
        {record.error_msg && (
          <>
            <b>Error Message</b><br/>
            <pre>{JSON.stringify(parseJSONSafely(record.error_msg), null, 2)}</pre>
          </>
        )}
      </div>
    )
  }

  const expandedRowRender = record => {
    const columns = [
      { title: 'Status', key: 'status', render: record => {
        if(record.response_status_code === 200) return <Icon type="check" style={{color: "#00FF00"}}/>
        else return  <Icon type="close" style={{color: "red"}}/>
      } },
      { title: 'ID', dataIndex: '_id', key: '_id' },
      { title: 'Date', key: "invocation", render: (record) => <p>{record.invocation_time.toString()}</p>}
    ];

    return (
    <Table 
      showHeader={false} 
      columns={columns} 
      dataSource={record.invocation_logs} 
      pagination={false}
      expandedRowRender={expandedInvocations} 
      title={() => 'Invocations'} 
    /> );
  }

  const filterTable = (values) => {
     dispatch(set("uiState.eventFilters", values))
     setHasMoreEventLogs(true);
  }

  const loadFunc = () => {
    if(projects.length > 0){
      const dbType = getProjectConfig(projects, projectID, "modules.eventing.dbType");
      client.eventing.fetchEventLogs(projectID, eventFilters, eventLogs.length > 0 ? eventLogs[eventLogs.length-1]._id : 0, dbType)
      .then(res => {
        dispatch(set("eventLogs", eventLogs.concat(res)))
        if(res.length < 10) {
          setHasMoreEventLogs(false);
        }
      })
      .catch(ex => notify("error", "Error loading event logs", ex.toString()))
    }
  }

  const handleRefresh = () => {
    const dbType = getProjectConfig(projects, projectID, "modules.eventing.dbType");
    dispatch(increment("pendingRequests"));
    client.eventing.fetchEventLogs(projectID, eventFilters, 0, dbType)
    .then(res => dispatch(set("eventLogs", res)))
    .catch(ex => notify("error", "Error refreshing event logs", ex.toString()))
    .finally(() => dispatch(decrement("pendingRequests")))
  }

	return (
		<div>
			<Topbar showProjectSelector />
			<Sidenav selectedItem="eventing" />
			<div className='page-content page-content--no-padding'>
				<EventTabs activeKey="event-logs" projectID={projectID} />
			<div className="event-tab-content">
        <Button size="large" style={{marginRight: 16}} onClick={handleRefresh}>Refresh <Icon type="reload" /></Button>
        <Button size="large" onClick={() => setModalVisible(true)}>Filters <Icon type="filter" /></Button>
        <InfiniteScroll
          pageStart={0}
          loadMore={loadFunc}
          hasMore={hasMoreEventLogs}
          loader={<div style={{textAlign: "center"}} key={0}>Loading...</div>}
        >
          <Table
           className="event-logs-table"
           columns={columns}
           dataSource={eventLogs}
           expandedRowRender={expandedRowRender}
           bordered
           pagination={false}
          /> 
        </InfiniteScroll> 
			</div>
			</div>
      {modalVisible && (
        <FilterForm
         projectID={projectID}
         visible={modalVisible}
         filterTable={filterTable}
         handleCancel={() => {setModalVisible(false);setHasMoreEventLogs(false)}}
         projectID={projectID}
        />
      )}
		</div>
	)
}

export default EventingLogs;
