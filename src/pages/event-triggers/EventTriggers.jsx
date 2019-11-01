import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import store from '../../store'
import { Table, Button, Icon } from "antd"
import '../../index.css';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import RuleForm from "../../components/event-triggers/RuleForm";
import TriggerForm from "../../components/event-triggers/TriggerForm";
import { get, set, increment, decrement } from "automate-redux";
import { getEventSourceFromType, notify } from '../../utils';
import service from '../../client';

const Rules = (props) => {
	const [ruleModalVisible, setRuleModalVisibile] = useState(false)
	const [triggerModalVisible, setTriggerModalVisibile] = useState(false)
	const [ruleClicked, setRuleClicked] = useState("")

	useEffect(() => {
		ReactGA.pageview("/projects/event-triggers");
	}, [])
	const noOfRules = Object.keys(props.rules).length

	const data = Object.entries(props.rules).map(([name, rule]) => Object.assign({}, { name }, rule))
	const clickedRule = data.find(obj => obj.name === ruleClicked)

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

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name'
		},
		{
			title: 'Source',
			key: 'source',
			render: (_, record) => {
				const source = getEventSourceFromType(record.type)
				return source.charAt(0).toUpperCase() + source.slice(1)
			}
		},
		{
			title: 'Service',
			dataIndex: 'service'
		},
		{
			title: 'Function',
			dataIndex: 'func'
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
						<a style={{ color: "red" }} onClick={() => props.handleDeleteEventTriggerRule(record.name)}>Delete</a>
					</span>
				)
			}
		}
	];

	return (
		<div>
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="event-triggers" />
				<div className="page-content">
					{noOfRules > 0 && <div>
						<div style={{ textAlign: "right" }}>
							<Button type="primary" className="secondary-action" ghost
								onClick={() => setRuleModalVisibile(true)}>
								<Icon type='plus' /> Add Event Trigger
						  </Button>
						</div>
						<div style={{ marginTop: "32px" }}>
							<Table columns={columns} dataSource={data} rowKey={(record) => record.name} />
						</div>
					</div>}
					{/* {!noOfRules && <EmptyState
						graphics={rulesImg} desc="Add asynchronous triggers in your app"
						buttonText="Add first trigger"
						handleClick={() => setRuleModalVisibile(true)} />} */}
					{ruleModalVisible && <RuleForm
						handleCancel={handleRuleModalCancel}
						handleSubmit={props.handleSubmitEventTriggerRule}
						initialValues={clickedRule} />}
					{triggerModalVisible && <TriggerForm
						handleCancel={handleTriggerModalCancel}
						handleSubmit={(payload) => props.handleTriggerEvent(clickedRule.type, payload)} />}
				</div>
			</div>
		</div>
	)
}

const mapStateToProps = (state) => {
	return {
		rules: get(state, `config.modules.eventing.rules`, {}),
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	const projectId = ownProps.match.params.projectId
	return {
		handleSubmitEventTriggerRule: (name, type, service, func, retries, options = {}) => {
			const rules = get(store.getState(), "config.modules.eventing.rules", {})
			const newRule = {
				type, service, func, retries, options
			}
			const newRules = Object.assign({}, rules, { [name]: newRule })
			dispatch(set("config.modules.eventing.rules", newRules))
		},
		handleDeleteEventTriggerRule: (name) => {
			const newRules = Object.assign({}, get(store.getState(), "config.modules.eventing.rules", {}))
			delete newRules[name]
			dispatch(set("config.modules.eventing.rules", newRules))
		},
		handleTriggerEvent: (type, payload) => {
			try {
				payload = JSON.parse(payload)
				const eventBody = { type, delay: 0, timestamp: new Date().getTime(), payload, options: {} }
				dispatch(increment("pendingRequests"))
				service.triggerEvent(projectId, eventBody)
					.then(() => notify("success", "Success", "Event queued successfully to the eventing system"))
					.catch(err => notify("error", "Error", err))
					.finally(() => dispatch(decrement("pendingRequests")))
			} catch (e) {
				notify("error", "Error", e.toString())
			}
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Rules);
