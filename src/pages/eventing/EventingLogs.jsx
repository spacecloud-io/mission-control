import React, { useState } from 'react';
import {useParams} from "react-router-dom";
import {Button, Icon, Table} from "antd";
import '../../index.css';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import FilterForm from "../../components/eventing/FilterForm";
import './event.css';

const data = [
  {
    _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
    rule_name: "Email trigger",
    invocations: [
      {
        response_status_code: 200,
        _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
        invocation_time: new Date(),
        request_payload: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`,
        response_body: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`
      }
    ],
    status: "processed",
    event_timestamp: 1583496732
  },
  {
    _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
    rule_name: "File upload",
    invocations: [
      {
        _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
        response_status_code: 404,
        invocation_time: new Date(),
        request_payload: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`,
        response_body: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`
      },
      {
        _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
        response_status_code: 200,
        invocation_time: new Date(),
        request_payload: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`,
        response_body: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`
      }
    ],
    status: "failed",
    event_timestamp: 1583477122
  },
  {
    _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
    rule_name: "Some trigger",
    invocations: [],
    status: "staged",
    event_timestamp: 1583477122
  },
  {
    _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
    rule_name: "Trigger 1",
    invocations: [
      {
        response_status_code: 200,
        _id: "1b6b8a79-d4c6-45c8-a4a9-84ff6ec6036d",
        invocation_time: new Date(),
        request_payload: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`,
        response_body: `[{"value":"application/json","name":"Content-type"},{"value":"hasura-graphql-engine/v1.1.0","name":"User-Agent"}]`
      }
    ],
    status: "processed",
    event_timestamp: 1583477122
  }
]

const columns = [
  { title: 'Event ID', dataIndex: '_id', key: '_id' },
  { title: 'Trigger name', dataIndex: 'rule_name', key: 'rule_name' },
  { title: 'Invocations', key: 'invocations', render: text => <p>{text.invocations.length}</p> },
  { title: 'Status', key: 'status', render: text => {
    if(text.status === "processed") return <Icon type="check" style={{color: "#00FF00"}}/>
    else if(text.status === "failed") return <Icon type="close" style={{color: "red"}}/>
    else return <Icon type="hourglass" />
  } },
  { title: 'Created at', key: 'date', render:(text) => <p>{new Date(text.event_timestamp).toString()}</p> },
];

const EventingLogs = () => {
  // Router params
  const { projectID } = useParams()
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState(data);
  
  const expandedInvocations = record => {
    const requestJSON = JSON.parse(record.request_payload);
    const responseJSON = JSON.parse(record.response_body);
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
      { title: 'Status', key: 'status', render: text => {
        if(text.response_status_code === 200) return <Icon type="check" style={{color: "#00FF00"}}/>
        else return  <Icon type="close" style={{color: "red"}}/>
      } },
      { title: 'ID', dataIndex: '_id', key: '_id' },
      { title: 'Date', key: "invocation", render: (text) => <p>{text.invocation_time.toString()}</p>}
    ];

    return (
    <Table 
      showHeader={false} 
      columns={columns} 
      dataSource={record.invocations} 
      pagination={false}
      expandedRowRender={expandedInvocations} 
      title={() => 'Invocations'} 
    /> );
  }

  const filterTable = (values) => {
     setFilteredData(data.filter(val => values.status.some(el => el === val.status)))
  }

	return (
		<div>
			<Topbar showProjectSelector />
			<Sidenav selectedItem="eventing" />
			<div className='page-content page-content--no-padding'>
				<EventTabs activeKey="event-logs" projectID={projectID} />
			<div className="event-tab-content">
        <Button size="large" style={{marginRight: 16}}>Refresh <Icon type="reload" /></Button>
        <Button size="large" onClick={() => setModalVisible(true)}>Filters <Icon type="filter" /></Button>
        <Table
          className="event-logs-table"
          columns={columns}
          dataSource={filteredData}
          expandedRowRender={expandedRowRender}
          bordered
        />  
			</div>
			</div>
      {modalVisible && (
        <FilterForm
          visible={modalVisible}
          filterTable={filterTable}
          handleCancel={() => setModalVisible(false)}
          triggerNames={data.map(val => val.rule_name)}
        />
      )}
		</div>
	)
}

export default EventingLogs;
