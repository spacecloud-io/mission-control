import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Alert, Row, Col } from "antd"
import '../../index.css';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import RuleForm from "../../components/event-triggers/RuleForm";
import TriggerForm from "../../components/event-triggers/TriggerForm";
import EventTabs from "../../components/event-triggers/event-tabs/EventTabs";
import { increment, decrement } from "automate-redux";
import { getEventSourceFromType, notify, getProjectConfig, getEventSourceLabelFromType, setProjectConfig } from '../../utils';
import client from '../../client';
import eventTriggersSvg from "../../assets/event-triggers.svg"
import history from '../../history'
import { dbIcons } from '../../utils';
import './event.css'


const EventTriggersOverview = () => {
	// Router params
	const { projectID } = useParams()

	const dispatch = useDispatch()

	// Global state
	const projects = useSelector(state => state.projects)

	// Component state
	const [ruleModalVisible, setRuleModalVisibile] = useState(false)
	const [triggerModalVisible, setTriggerModalVisibile] = useState(false)
	const [ruleClicked, setRuleClicked] = useState("")

	// Derived properties
	const rules = getProjectConfig(projects, projectID, "modules.eventing.rules", {})
	// changes
	const crudModuleFetch = getProjectConfig(projects, projectID, "modules.crud", {})
	const dbList = Object.entries(crudModuleFetch).map(([alias, obj]) => {
		if (!obj.type) obj.type = alias
		return { alias: alias, dbtype: obj.type, svgIconSet: dbIcons(projects, projectID, alias) }
	})
	const rulesTableData = Object.entries(rules).map(([name, { type }]) => ({ name, type }))
	const noOfRules = rulesTableData.length
	const ruleClickedInfo = ruleClicked ? { name: ruleClicked, ...rules[ruleClicked] } : undefined
	useEffect(() => {
		ReactGA.pageview("/projects/event-triggers/overview");
	}, [])

	// Handlers
	const handleEditRuleClick = (name) => {
		setRuleClicked(name)
		setRuleModalVisibile(true)
	}

	const handleTriggerRuleClick = (name) => {
		setRuleClicked(name)
		setTriggerModalVisibile(true)
	}

	const handleRuleModalCancel = () => {
		setRuleClicked("")
		setRuleModalVisibile(false)
	}

	const handleTriggerModalCancel = () => {
		setRuleClicked("")
		setTriggerModalVisibile(false)
	}

	const handleSetRule = (name, type, url, retries, timeout, options = {}) => {
		const triggerRule = { type, url, retries, timeout, options }
		const isRulePresent = rules[name] ? true : false
		dispatch(increment("pendingRequests"))
		client.eventTriggers.setTriggerRule(projectID, name, triggerRule).then(() => {
			setProjectConfig(projectID, `modules.eventing.rules.${name}`, triggerRule)
			notify("success", "Success", `${isRulePresent ? "Modified" : "Added"} trigger rule successfully`)
		}).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
	}

	const handleDeleteRule = (name) => {
		const newRules = Object.assign({}, rules)
		delete newRules[name]
		client.eventTriggers.deleteTriggerRule(projectID, name).then(() => {
			setProjectConfig(projectID, `modules.eventing.rules`, newRules)
			notify("success", "Success", "Deleted trigger rule successfully")
		}).catch(ex => notify("error", "Error", ex)).finally(() => dispatch(decrement("pendingRequests")))
	}

	const handleTriggerEvent = (type, payload) => {
		dispatch(increment("pendingRequests"))
		const eventBody = { type, delay: 0, timestamp: new Date().getTime(), payload, options: {} }
		client.eventTriggers.queueEvent(projectID, eventBody).then(() => {
			notify("success", "Success", "Event successfully queued to Space Cloud")
		})
			.catch(err => notify("error", "Error", err))
			.finally(() => dispatch(decrement("pendingRequests")))
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
						{source === "custom" && <a onClick={() => handleTriggerRuleClick(record.name)}>Trigger</a>}
						<a style={{ color: "red" }} onClick={() => handleDeleteRule(record.name)}>Delete</a>
					</span>
				)
			}
		}
	]

	const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})
	const activeDB = Object.keys(crudModule).find(db => {
		return crudModule[db].enabled
	})

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
			<Sidenav selectedItem="event-triggers" />
			<div className='page-content page-content--no-padding'>
				<EventTabs activeKey="overview" projectID={projectID} />
			<div className="event-tab-content">
				{noOfRules === 0 && <div>
					<div className="panel">
						<img src={eventTriggersSvg} />
						<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Trigger asynchronous business logic reliably on any events via the eventing queue in Space Cloud. <a href="https://docs.spaceuptech.com/advanced/event-triggers">View Docs.</a></p>
						<Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setRuleModalVisibile(true)} disabled={!activeDB}>Add first event trigger</Button>
						{dbAlert()}
					</div>
				</div>}
				{noOfRules > 0 && (
					<React.Fragment>
						<h3 style={{ display: "flex", justifyContent: "space-between" }}>Event Triggers <Button onClick={() => setRuleModalVisibile(true)} type="primary">Add</Button></h3>
						<Table columns={columns} dataSource={rulesTableData} />
					</React.Fragment>
				)}
				{ruleModalVisible && <RuleForm
					handleCancel={handleRuleModalCancel}
					handleSubmit={handleSetRule}
					dbList={dbList}
					initialValues={ruleClickedInfo} />}
				{triggerModalVisible && <TriggerForm
					handleCancel={handleTriggerModalCancel}
					handleSubmit={(payload) => handleTriggerEvent(ruleClickedInfo.type, payload)} />}
			</div>
			</div>
		</div>
	)
}

export default EventTriggersOverview;
