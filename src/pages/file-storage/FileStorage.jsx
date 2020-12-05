import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import AddRuleForm from "../../components/file-storage/AddRuleForm"
import EditPrefixForm from "../../components/file-storage/EditPrefixForm"
import { notify, getFileStorageProviderLabelFromStoreType, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../utils';
import { useHistory } from "react-router-dom";
import fileStorageSvg from "../../assets/file-storage.svg"
import { Button, Descriptions, Badge, Popconfirm, Table, Input, Empty } from "antd"
import disconnectedImg from "../../assets/disconnected.jpg"
import { loadFileStoreConnState, deleteFileStoreRule, saveFileStoreRule, saveFileStoreConfig, saveFileStorePrefix, getFileStoreRules, getFileStoreConfig, getFileStoreConnState, loadFileStoreRules } from '../../operations/fileStore';
import { securityRuleGroups, projectModules, actionQueuedMessage } from '../../constants';
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

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
	const [prefixModalVisible, setPrefixModalVisible] = useState(false)
	const [selectedRuleName, setSelectedRuleName] = useState("")
	const [searchText, setSearchText] = useState('')

	// Derived state
	const selectedRuleInfo = rules.find(obj => obj.id === selectedRuleName)
	const selectedRulePrefix = selectedRuleInfo ? selectedRuleInfo.prefix : ""

	// Derived state
	const { enabled, ...connConfig } = config

	// Handlers
	const handleFileConfig = () => {
		history.push(`/mission-control/projects/${projectID}/file-storage/configure`);
	}

	const handleConfig = (config) => {
		const newConfig = { enabled: true, ...config }
		incrementPendingRequests()
		saveFileStoreConfig(projectID, newConfig)
			.then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Configured file storage successfully"))
			.catch(ex => notify("error", "Error configuring file storage", ex))
			.finally(() => decrementPendingRequests())
	}

	const handleAddRule = (ruleName, prefix, securityRule) => {
		return new Promise((resolve, reject) => {
			incrementPendingRequests()
			saveFileStoreRule(projectID, ruleName, { prefix: prefix, rule: securityRule })
				.then(({ queued }) => {
					notify("success", "Success", queued ? actionQueuedMessage : "Added rule successfully")
					resolve()
				})
				.catch(ex => {
					notify("error", "Error adding rule", ex)
					reject(ex)
				})
				.finally(() => decrementPendingRequests())
		})
	}

	const handleDeleteRule = (ruleName) => {
		incrementPendingRequests()
		deleteFileStoreRule(projectID, ruleName)
			.then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Deleted rule successfully"))
			.catch(ex => notify("error", "Error deleting rule", ex))
			.finally(() => decrementPendingRequests())
	}

	const handleSecureClick = (ruleName) => openSecurityRulesPage(projectID, securityRuleGroups.FILESTORE, ruleName)

	const handleClickEditPrefix = (ruleName) => {
		setSelectedRuleName(ruleName)
		setPrefixModalVisible(true)
	}

	const handleCancelEditPrefix = () => {
		setSelectedRuleName("")
		setPrefixModalVisible(false)
	}

	const handleEditPrefix = (newPrefix) => {
		return new Promise((resolve, reject) => {
			incrementPendingRequests()
			saveFileStorePrefix(projectID, selectedRuleName, newPrefix)
				.then(({ queued }) => {
					notify("success", "Success", queued ? actionQueuedMessage : "Saved prefix successfully")
					resolve()
				})
				.catch(ex => {
					notify("error", "Error saving prefix", ex)
					reject(ex)
				})
				.finally(() => decrementPendingRequests())
		})
	}

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

	const filteredRules = rules.filter(rule => {
		return rule.id.toLowerCase().includes(searchText.toLowerCase()) ||
			rule.prefix.toLowerCase().includes(searchText.toLowerCase())
	})

	const columns = [
		{
			title: 'Rule name',
			dataIndex: 'id',
			key: 'id',
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
			title: 'Prefix',
			dataIndex: 'prefix',
			key: 'prefix',
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
			title: 'Actions',
			key: 'actions',
			className: "column-actions",
			render: (record) => {
				return (
					<span>
						<a onClick={() => handleClickEditPrefix(record.id)}>Edit prefix</a>
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
				<Sidenav selectedItem={projectModules.FILESTORE} />
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
							<div style={{ margin: '32px 0 16px 0', display: "flex", justifyContent: "space-between" }}>
							<h3 style={{ margin: 'auto 0' }}>Security Rules {filteredRules.length ? `(${filteredRules.length})` : ''}</h3>
								<div style={{ display: 'flex' }}>
									<Input.Search placeholder='Search by rule name or prefix' style={{ minWidth: '320px' }} onChange={e => setSearchText(e.target.value)} allowClear={true} />
									<Button style={{ marginLeft: '16px' }} onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button>
								</div>
							</div>
							<Table
								dataSource={filteredRules}
								columns={columns}
								locale={{
									emptyText: rules.length !== 0 ?
										<EmptySearchResults searchText={searchText} /> :
										<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No security rule created yet. Add a security rule' />
								}} />
						</React.Fragment>}
					</React.Fragment>}
					{addRuleModalVisible && <AddRuleForm
						handleSubmit={handleAddRule}
						handleCancel={() => setAddRuleModalVisible(false)} />}
					{prefixModalVisible && <EditPrefixForm
						prefix={selectedRulePrefix}
						handleSubmit={handleEditPrefix}
						handleCancel={handleCancelEditPrefix} />}
				</div>
			</div>
		</div>
	)
}

export default Rules;