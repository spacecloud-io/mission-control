import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector } from 'react-redux';
import { Table, Button, Alert, Row, Col } from "antd"
import '../../index.css';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import RuleForm from "../../components/eventing/RuleForm";
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import { getEventSourceFromType, notify, getEventSourceLabelFromType, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import eventingSvg from "../../assets/eventing.svg"
import { dbIcons } from '../../utils';
import './event.css'
import history from "../../history"
import { deleteEventingTriggerRule, saveEventingTriggerRule, getEventingTriggerRules } from '../../operations/eventing';
import { getDbsConfig } from '../../operations/database';


const EventingOverview = () => {
	// Router params
	const { projectID } = useParams()

	useEffect(() => {
		ReactGA.pageview("/projects/eventing/overview");
	}, [])

	// Global state
	const rules = useSelector(state => getEventingTriggerRules(state))
	const dbsConfig = useSelector(state => getDbsConfig(state))

	// Component state
	const [ruleModalVisible, setRuleModalVisibile] = useState(false)
	const [ruleClicked, setRuleClicked] = useState("")

	// Derived properties
	const activeDB = Object.keys(dbsConfig).find(db => {
		return dbsConfig[db].enabled
	})
	const dbList = Object.entries(dbsConfig).map(([alias, obj]) => {
		if (!obj.type) obj.type = alias
		return { alias: alias, dbtype: obj.type, svgIconSet: dbIcons(alias) }
	})
	const rulesTableData = Object.entries(rules).map(([name, { type }]) => ({ name, type }))
	const noOfRules = rulesTableData.length
	const ruleClickedInfo = ruleClicked ? { name: ruleClicked, ...rules[ruleClicked] } : undefined

	// Handlers
	const handleEditRuleClick = (name) => {
		setRuleClicked(name)
		setRuleModalVisibile(true)
	}

	const handleTriggerRuleClick = (eventType) => {
		history.push(`/mission-control/projects/${projectID}/eventing/queue-event`, { eventType })
	}

	const handleRuleModalCancel = () => {
		setRuleClicked("")
		setRuleModalVisibile(false)
	}

	const handleSetRule = (name, type, url, retries, timeout, options = {}) => {
		const isRulePresent = rules[name] ? true : false
		return new Promise((resolve, reject) => {
			incrementPendingRequests()
			saveEventingTriggerRule(projectID, name, type, url, retries, timeout, options)
				.then(() => {
					notify("success", "Success", `${isRulePresent ? "Modified" : "Added"} trigger rule successfully`)
					resolve()
				})
				.catch(ex => {
					notify("error", `Error ${isRulePresent ? "Modifying" : "Adding"} trigger rule`, ex)
					reject()
				})
				.finally(() => decrementPendingRequests())
		})
	}

	const handleDeleteRule = (name) => {
		incrementPendingRequests()
		deleteEventingTriggerRule(projectID, name)
			.then(() => notify("success", "Success", "Deleted trigger rule successfully"))
			.catch(ex => notify("error", "Error deleting trigger rule", ex))
			.finally(() => decrementPendingRequests())
	}

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name'
		},
		{
			title: 'Source',
			key: 'source',
			render: (_, record) => getEventSourceLabelFromType(record.type)
		},
		{
			title: 'Actions',
			className: 'column-actions',
			render: (_, record) => {
				const source = getEventSourceFromType(record.type)
				return (
					<span>
						<a onClick={() => handleEditRuleClick(record.name)}>Edit</a>
						{source === "custom" && <a onClick={() => handleTriggerRuleClick(record.type)}>Trigger</a>}
						<a style={{ color: "red" }} onClick={() => handleDeleteRule(record.name)}>Delete</a>
					</span>
				)
			}
		}
	]

	const alertMsg = <div>
		<span>Space Cloud needs a database to store the event logs. First</span>
		<Link to={`/mission-control/projects/${projectID}/database/add-db`}> add a database </Link>
		<span>to Space Cloud so that eventing module can use it.</span>
	</div>

	const dbAlert = () => {
		if (!activeDB)
			return (
				<Row>
					<Col lg={{ span: 18, offset: 3 }}>
						<Alert style={{ top: 15 }}
							message="Eventing needs to be configured"
							description={alertMsg}
							type="info"
							showIcon
						/>
					</Col>
				</Row>
			)
	}

	return (
		<div>
			<Topbar showProjectSelector />
			<Sidenav selectedItem="eventing" />
			<div className='page-content page-content--no-padding'>
				<EventTabs activeKey="overview" projectID={projectID} />
				<div className="event-tab-content">
					{noOfRules === 0 && <div>
						<div className="panel">
							<img src={eventingSvg} />
							<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Trigger asynchronous business logic reliably on any events via the eventing queue in Space Cloud. <a href="https://docs.spaceuptech.com/microservices/eventing">View Docs.</a></p>
							<Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setRuleModalVisibile(true)} disabled={!activeDB}>Add first event trigger</Button>
							{dbAlert()}
						</div>
					</div>}
					{noOfRules > 0 && (
						<React.Fragment>
							<h3 style={{ display: "flex", justifyContent: "space-between" }}>Event Triggers <Button onClick={() => setRuleModalVisibile(true)} type="primary">Add</Button></h3>
							<Table columns={columns} dataSource={rulesTableData} rowKey="name" />
						</React.Fragment>
					)}
					{ruleModalVisible && <RuleForm
						handleCancel={handleRuleModalCancel}
						handleSubmit={handleSetRule}
						dbList={dbList}
						initialValues={ruleClickedInfo} />}
				</div>
			</div>
		</div>
	)
}

export default EventingOverview;
