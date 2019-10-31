import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector, useDispatch } from 'react-redux';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import ConfigurationForm from "../../../components/file-storage/ConfigurationForm"
import AddRuleForm from "../../../components/file-storage/AddRuleForm"
import RuleEditor from "../../../components/rule-editor/RuleEditor"
import { get, set, increment, decrement } from "automate-redux";
import { getProjectConfig, notify, setProjectConfig } from '../../../utils';
import fileStorageSvg from "../../../assets/filestore.svg"
import { Button, Descriptions, Badge } from "antd"
import client from "../../../client"
import disconnectedImg from "../../../assets/disconnected.jpg"
import securitySvg from "../../../assets/security.svg"

const Rules = (props) => {
	// Router params
	const { projectID } = useParams()

	const dispatch = useDispatch()

	// Global state
	const projects = useSelector(state => state.projects)
	const connected = useSelector(state => get(state, `extraConfig.${projectID}.fileStore.connected`))

	// Component state
	const [configurationModalVisible, setConfigurationModalVisible] = useState(false)
	const [addRuleModalVisible, setAddRuleModalVisible] = useState(false)
	let [selectedRuleName, setSelectedRuleName] = useState("")

	useEffect(() => {
		ReactGA.pageview("/projects/file-storage/rules");
	}, [])

	// Derived properties
	const { rules = [], ...config } = getProjectConfig(projects, projectID, "modules.fileStore", {})
	const { enabled, ...connConfig } = config
	const noOfRules = rules.length;
	const rulesMap = rules.reduce((prev, curr) => {
		return Object.assign(prev, {
			[curr.name]: {
				prefix: curr.prefix,
				rule: curr.rule
			}
		})
	}, {})

	useEffect(() => {
		if (!selectedRuleName && noOfRules > 0) {
			setSelectedRuleName(rules[0].name)
		}
	}, [selectedRuleName, noOfRules])

	// Handlers
	const handleConfig = (config) => {
		dispatch(increment("pendingRequests"))
		const newConfig = { enabled, ...config }
		client.fileStore.setConfig(projectID, newConfig).then(() => {
			const curentConfig = getProjectConfig(projects, projectID, "modules.fileStore", {})
			setProjectConfig(projects, projectID, "modules.fileStore", Object.assign({}, curentConfig, newConfig))
			dispatch(set(`extraConfig.${projectID}.fileStore.connected`, true))
			notify("success", "Success", "Configured file storage successfully")
		})
			.catch(ex => notify("error", "Error", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	const handleSaveRule = (rule) => {
		dispatch(increment("pendingRequests"))
		client.fileStore.setRule(projectID, selectedRuleName, rule).then(() => {
			const newRules = rules.map(r => {
				if (r.name !== selectedRuleName) return rule
				return Object.assign({}, r, rule)
			})
			setProjectConfig(projects, projectID, "modules.fileStore.rules", newRules)
			notify("success", "Success", "Saved rule successfully")
		})
			.catch(ex => notify("error", "Error", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	const handleAddRule = (ruleName, rule) => {
		dispatch(increment("pendingRequests"))
		client.fileStore.setRule(projectID, ruleName, rule).then(() => {
			const newRules = [...rules, { name: ruleName, ...rule }]
			setProjectConfig(projects, projectID, "modules.fileStore.rules", newRules)
			notify("success", "Success", "Added rule successfully")
		})
			.catch(ex => notify("error", "Error", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	const handleDeleteRule = (ruleName) => {
		dispatch(increment("pendingRequests"))
		client.fileStore.deleteRule(projectID, ruleName).then(() => {
			const newRules = rules.filter(r => r.name !== ruleName)
			setProjectConfig(projects, projectID, "modules.fileStore.rules", newRules)
			notify("success", "Success", "Deleted rule successfully")
		})
			.catch(ex => notify("error", "Error", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	const fetchConnState = () => {
		dispatch(increment("pendingRequests"))
		client.fileStore.getConnectionState(projectID).then(connected => {
			dispatch(set(`extraConfig.${projectID}.fileStore.connected`, connected))
		})
			.catch(ex => notify("error", "Error fetching connection status", ex))
			.finally(() => dispatch(decrement("pendingRequests")))
	}

	useEffect(() => {
		fetchConnState()
	}, [])

	const SidePanel = () => {
		return <div className="panel panel--has-border-right">
			<div className="panel__graphic">
				<img src={securitySvg} width="70%" />
			</div>
			<p className="panel__description" style={{ marginTop: 16, marginBottom: 0 }}>Secure who can access what</p>
			<a style={{ marginTop: 4 }} target="_blank" href="https://docs.spaceuptech.com/auth/authorization" className="panel__link"><span>View docs</span> <i className="material-icons">launch</i></a>
		</div>
	}

	const EmptyState = () => {
		return <div style={{ marginTop: 24 }}>
			<div className="panel" style={{ margin: 24 }}>
				<img src={securitySvg} width="240px" />
				<p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Security rules help you restrict access to your files. <a href="https://docs.spaceuptech.com/auth/authorization">View Docs.</a></p>
				<Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setAddRuleModalVisible(true)}>Add your first rule</Button>
			</div>
		</div>
	}
	return (
		<div>
			<Topbar showProjectSelector />
			<div className="flex-box">
				<Sidenav selectedItem="file-storage" />
				<div className="page-content">
					{!enabled && <div className="panel" style={{ margin: 48 }}>
						<img src={fileStorageSvg} width="240px" />
						<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Manage code on scalable storage backend via Space Cloud without server side code</p>
						<Button type="primary action-rounded" style={{ marginTop: 16 }} onClick={() => setConfigurationModalVisible(true)}>
							Get started
						</Button>
					</div>}
					{enabled && <React.Fragment>
						<h3>Provider Details <a style={{ textDecoration: "underline", fontSize: 14 }} onClick={() => setConfigurationModalVisible(true)}>(Edit)</a></h3>
						<Descriptions bordered>
							<Descriptions.Item label="Provider">{connConfig.storeType}</Descriptions.Item>
							<Descriptions.Item label="Status" >
								<Badge status="processing" text="Running" color={connected ? "green" : "red"} text={connected ? "connected" : "disconnected"} />
							</Descriptions.Item>
						</Descriptions>
						{!connected && <div className="empty-state">
							<div className="empty-state__graphic">
								<img src={disconnectedImg} alt="" />
							</div>
							<p className="empty-state__description">Oops... Space Cloud could not connect to your storage provider</p>
							<p className="empty-state__action-text">Make sure your connection details are correct</p>
							<div className="empty-state__action-bar">
								<Button className="action-rounded" type="default" onClick={() => handleConfig(connConfig)}>Reconnect</Button>
								<Button className="action-rounded" type="primary" style={{ marginLeft: 24 }} onClick={() => setConfigurationModalVisible(true)}>Edit Connection</Button>
							</div>
						</div>}
						{connected && <React.Fragment>
							{noOfRules > 0 && <React.Fragment>
								<h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
							</React.Fragment>}

							<div style={{ marginTop: noOfRules ? 0 : 24 }}>
								<RuleEditor rules={rulesMap}
									selectedRuleName={selectedRuleName}
									handleSelect={setSelectedRuleName}
									handleSubmit={handleSaveRule}
									canDeleteRules
									handleDelete={handleDeleteRule}
									emptyState={<EmptyState />}
									sidePanel={<SidePanel />} />
							</div>
						</React.Fragment>}
					</React.Fragment>}
					{configurationModalVisible && <ConfigurationForm
						handleSubmit={props.saveConfig}
						handleCancel={() => setConfigurationModalVisible(false)}
						initialValues={connConfig} />}
					{addRuleModalVisible && <AddRuleForm
						handleSubmit={handleAddRule}
						handleCancel={() => setAddRuleModalVisible(false)} />}
				</div>
			</div>
		</div>
	)
}

export default Rules;