import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector } from 'react-redux';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import AddRuleForm from "../../components/file-storage/AddRuleForm"
import { notify, getFileStorageProviderLabelFromStoreType, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../utils';
import { useHistory } from "react-router-dom";
import fileStorageSvg from "../../assets/file-storage.svg"
import { Button, Descriptions, Badge, Popconfirm, Table } from "antd"
import disconnectedImg from "../../assets/disconnected.jpg"
import { loadFileStoreConnState, deleteFileStoreRule, saveFileStoreRule, saveFileStoreConfig, getFileStoreRules, getFileStoreConfig, getFileStoreConnState, loadFileStoreRules } from '../../operations/fileStore';
import { securityRuleGroups } from '../../constants';

const Rules = () => {
	const history = useHistory();
	// Router params
	const { projectID } = useParams()

	// Global state
	const connected = useSelector(state => getFileStoreConnState(state))
	const rules = useSelector(state => getFileStoreRules(state))
	const config = useSelector(state => getFileStoreConfig(state))

	// Component state
	const [addRuleModalVisible, setAddRuleModalVisible] = useState(false)
	let [selectedRuleName, setSelectedRuleName] = useState("")

	useEffect(() => {
		ReactGA.pageview("/projects/file-storage");
	}, [])

	// Derived state
	const { enabled, ...connConfig } = config
	const noOfRules = rules.length;

	useEffect(() => {
		if (!selectedRuleName && noOfRules > 0) {
			setSelectedRuleName(rules[0].id)
		}
	}, [selectedRuleName, noOfRules])

	// Handlers
	const handleFileConfig = () => {
		history.push(`/mission-control/projects/${projectID}/file-storage/configure`);
	}

	const handleConfig = (config) => {
		const newConfig = { enabled: true, ...config }
		incrementPendingRequests()
		saveFileStoreConfig(projectID, newConfig)
			.then(() => notify("success", "Success", "Configured file storage successfully"))
			.catch(ex => notify("error", "Error configuring file storage", ex))
			.finally(() => decrementPendingRequests())
	}

	const handleAddRule = (ruleName, prefix, securityRule) => {
		incrementPendingRequests()
		saveFileStoreRule(projectID, ruleName, { prefix: prefix, rule: securityRule })
			.then(() => notify("success", "Success", "Added rule successfully"))
			.catch(ex => notify("error", "Error adding rule", ex))
			.finally(() => decrementPendingRequests())
	}

	const handleDeleteRule = (ruleName) => {
		incrementPendingRequests()
		deleteFileStoreRule(projectID, ruleName)
			.then(() => notify("success", "Success", "Deleted rule successfully"))
			.catch(ex => notify("error", "Error deleting rule", ex))
			.finally(() => decrementPendingRequests())
	}

	const handleSecureClick = (ruleName) => openSecurityRulesPage(projectID, securityRuleGroups.FILESTORE, ruleName)

	useEffect(() => {
		incrementPendingRequests()
		loadFileStoreConnState(projectID)
			.catch(ex => notify("error", "Error fetching connection status", ex))
			.finally(() => decrementPendingRequests())
	}, [])

	useEffect(() => {
		incrementPendingRequests()
		loadFileStoreRules(projectID)
			.catch(ex => notify("error", "Error fetching file storage rules", ex))
			.finally(() => decrementPendingRequests())
	}, [])

	const columns = [
		{
			title: 'Rule name',
			dataIndex: 'id',
			key: 'id',
		},
		{
			title: 'Prefix',
			dataIndex: 'prefix',
			key: 'prefix',
		},
		{
			title: 'Actions',
			key: 'actions',
			className: "column-actions",
			render: (record) => {
				return (
					<span>
						<a onClick={() => handleSecureClick(record.id)}>Secure</a>
						<Popconfirm
							title="Are you sure you want to delete this rule?"
							onConfirm={() => handleDeleteRule(record.id)}
						>
							<a style={{ color: "red" }}>Delete</a>
						</Popconfirm>
					</span>
				)
			}
		},
	]
	return (
		<div className="file-storage">
			<Topbar showProjectSelector />
			<div>
				<Sidenav selectedItem="file-storage" />
				<div className="page-content">
					{!enabled && <div className="panel">
						<img src={fileStorageSvg} />
						<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Manage files on scalable storage backend via Space Cloud without server side code</p>
						<Button type="primary action-rounded" style={{ marginTop: 16 }} onClick={handleFileConfig}>
							Get started
						</Button>
					</div>}
					{enabled && <React.Fragment>
						<h3>Provider Details <a style={{ textDecoration: "underline", fontSize: 14 }} onClick={handleFileConfig}>(Edit)</a></h3>
						<Descriptions bordered>
							<Descriptions.Item label="Provider">{getFileStorageProviderLabelFromStoreType(connConfig.storeType)}</Descriptions.Item>
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
								<Button className="action-rounded" type="primary" style={{ marginLeft: 24 }} onClick={handleFileConfig}>Edit Connection</Button>
							</div>
						</div>}
						{connected && <React.Fragment>
							{noOfRules > 0 && <React.Fragment>
								<h3 style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
							</React.Fragment>}
							<div style={{ marginTop: noOfRules ? 0 : 24 }}>
								<Table dataSource={rules} columns={columns} />
							</div>
						</React.Fragment>}
					</React.Fragment>}
					{addRuleModalVisible && <AddRuleForm
						handleSubmit={handleAddRule}
						handleCancel={() => setAddRuleModalVisible(false)} />}
				</div>
			</div>
		</div>
	)
}

export default Rules;