import React, { useState, useEffect } from 'react';
import {useParams} from "react-router-dom";
import {Button, Icon, Table} from "antd";
import '../../index.css';
import client from "../../client";
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

function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
    return str;
  }
  const jsonObj = JSON.parse(str)
  return jsonObj;
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
  const [moreEventLogs, hasMoreEventLogs] = useState(true);

  useEffect(() => {
    dispatch(increment("pendingRequests"));
    client.eventing.fetchEventLogs(projectID, eventFilters, 0, "mysql")
    .then(res => dispatch(set("eventLogs", res)))
    .catch(ex => console.log(ex))
    .finally(() => dispatch(decrement("pendingRequests")))
  }, [eventFilters])
  
  const expandedInvocations = record => {
    const requestJSON = isJson(record.request_payload);
    const responseJSON = isJson(record.response_body); 
    return (
      <div>
        <b>Request payload</b><br/>
        <pre>{JSON.stringify(requestJSON, null, 2)}</pre><br/><br/>
        <b>Status Code</b><br/>
        {record.response_status_code}<br/><br/>
        <b>Response</b><br/>
        <pre>{JSON.stringify(responseJSON, null, 2)}</pre>
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
     console.log(values)
     dispatch(set("uiState.eventFilters", values))
     hasMoreEventLogs(true);
  }

  const loadFunc = () => {
    client.eventing.fetchEventLogs(projectID, eventFilters, eventLogs.length > 0 ? eventLogs[eventLogs.length-1]._id : 0)
    .then(res => {
      dispatch(set("eventLogs", eventLogs.concat(res)))
      if(res.length < 10) {
        hasMoreEventLogs(false);
      }
    })
    .catch(ex => console.log(ex))
  }

	return (
		<div>
			<Topbar showProjectSelector />
			<Sidenav selectedItem="eventing" />
			<div className='page-content page-content--no-padding'>
				<EventTabs activeKey="event-logs" projectID={projectID} />
			<div className="event-tab-content">
        <Button size="large" style={{marginRight: 16}} onClick={() => window.location.reload()}>Refresh <Icon type="reload" /></Button>
        <Button size="large" onClick={() => setModalVisible(true)}>Filters <Icon type="filter" /></Button>
        <InfiniteScroll
          pageStart={0}
          loadMore={loadFunc}
          hasMore={moreEventLogs}
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
         visible={modalVisible}
         filterTable={filterTable}
         handleCancel={() => setModalVisible(false)}
         projectID={projectID}
        />
      )}
		</div>
	)
}

export default EventingLogs;
