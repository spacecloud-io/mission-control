import React, { useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Table, Button, Alert, Row, Col, Input, Empty } from "antd"
import '../../index.css';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import RuleForm from "../../components/eventing/RuleForm";
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import { getEventSourceFromType, notify, getEventSourceLabelFromType, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../utils';
import eventingSvg from "../../assets/eventing.svg"
import './event.css'
import history from "../../history"
import { deleteEventingTriggerRule, saveEventingTriggerRule, getEventingTriggerRules, getEventingConfig } from '../../operations/eventing';
import { getDbConfigs } from '../../operations/database';
import { projectModules, actionQueuedMessage, securityRuleGroups } from '../../constants';
import Highlighter from 'react-highlight-words';
import { FilterOutlined } from '@ant-design/icons';
import FilterEvents from '../../components/eventing/FilterEvents';
import { useDispatch } from 'react-redux';
import { set } from 'automate-redux';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

const EventingOverview = () => {
	// Router params
	const { projectID } = useParams()
	const dispatch = useDispatch()

	// Global state
	const rules = useSelector(state => getEventingTriggerRules(state))
	const dbConfigs = useSelector(state => getDbConfigs(state))
	const eventingConfig = useSelector(state => getEventingConfig(state))
	const filters = useSelector(state => state.uiState.eventTriggerFilters)

	// Component state
	const [ruleModalVisible, setRuleModalVisibile] = useState(false)
	const [ruleClicked, setRuleClicked] = useState("")
	const [searchText, setSearchText] = useState('')
	const [filterModalVisible, setFilterModalVisible] = useState(false)

	// Derived state
	const dbList = Object.keys(dbConfigs)
	const rulesTableData = Object.entries(rules).map(([id, { type, options }]) => ({ id, source: getEventSourceFromType(type), type, options }))
	const noOfRules = rulesTableData.length
	const ruleClickedInfo = ruleClicked ? { id: ruleClicked, ...rules[ruleClicked] } : undefined
	const eventingConfigured = eventingConfig.enabled && eventingConfig.dbAlias
	const customEventTypes = rulesTableData.filter(obj => obj.source === "custom").map(obj => obj.type)

	// Handlers
	const handleEditRuleClick = (id) => {
		setRuleClicked(id)
		setRuleModalVisibile(true)
	}

	const handleFilterRuleClick = (triggerId) => openSecurityRulesPage(projectID, securityRuleGroups.EVENTING_FILTERS, triggerId)

	const handleTriggerRuleClick = (eventType) => {
		history.push(`/mission-control/projects/${projectID}/eventing/queue-event`, { eventType })
	}

	const handleRuleModalCancel = () => {
		setRuleClicked("")
		setRuleModalVisibile(false)
	}

	const handleFilter = (filters) => dispatch(set("uiState.eventTriggerFilters", filters))
	const applyFilters = (rules, filters = { source: '', options: {}, type: '' }) => {
		const dataFilteredBySource = filters && filters.source ? rules.filter(rule => rule.source === filters.source) : rules;
		const dataFilteredByOptionsDb = filters && filters.options && filters.options.db ? rules.filter(rule => rule.options && rule.options.db ? rule.options.db === filters.options.db : '') : dataFilteredBySource;
		const dataFilteredByOptionsCol = filters && filters.options && filters.options.col ? rules.filter(rule => rule.options && rule.options.col ? rule.options.col === filters.options.col : '') : dataFilteredByOptionsDb;
		const dataFilteredByType = filters && filters.type ? dataFilteredByOptionsCol.filter(rule => rule.type === filters.type) : dataFilteredByOptionsCol;
		const dataFilteredBySearch = dataFilteredByType.filter(rule => rule.id.toLowerCase().includes(searchText.toLowerCase()))
		return dataFilteredBySearch;
	}

	const filteredRulesData = applyFilters(rulesTableData, filters);

	const handleSetRule = (triggerRule) => {
		const id = triggerRule.id
		const isRulePresent = rules[id] ? true : false
		return new Promise((resolve, reject) => {
			incrementPendingRequests()
			saveEventingTriggerRule(projectID, id, triggerRule)
				.then(({ queued }) => {
					notify("success", "Success", queued ? actionQueuedMessage : `${isRulePresent ? "Modified" : "Added"} trigger rule successfully`)
					resolve()
				})
				.catch(ex => {
					notify("error", `Error ${isRulePresent ? "Modifying" : "Adding"} trigger rule`, ex)
					reject()
				})
				.finally(() => decrementPendingRequests())
		})
	}

	const handleDeleteRule = (id) => {
		incrementPendingRequests()
		deleteEventingTriggerRule(projectID, id)
			.then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Deleted trigger rule successfully"))
			.catch(ex => notify("error", "Error deleting trigger rule", ex))
			.finally(() => decrementPendingRequests())
	}

	const columns = [
		{
			title: 'Name',
			dataIndex: 'id',
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
						<a onClick={() => handleEditRuleClick(record.id)}>Edit</a>
						<a onClick={() => handleFilterRuleClick(record.id)}>Filtering Rules</a>
						{source === "custom" && <a onClick={() => handleTriggerRuleClick(record.type)}>Trigger</a>}
						<a style={{ color: "red" }} onClick={() => handleDeleteRule(record.id)}>Delete</a>
					</span>
				)
			}
		}
	]

	const alertMsg = <div>
		<span>Head over to the </span>
		<Link to={`/mission-control/projects/${projectID}/eventing/settings`}>Eventing Settings tab</Link>
		<span> to configure eventing.</span>
	</div>

	const dbAlert = () => {
		if (!eventingConfigured)
			return (
				<Row>
					<Col lg={{ span: 18, offset: 3 }}>
						<Alert style={{ top: 15 }}
							message={`Eventing needs to be configured${eventingConfig.enabled ? " properly" : ""}`}
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
			<Sidenav selectedItem={projectModules.EVENTING} />
			<div className='page-content page-content--no-padding'>
				<EventTabs activeKey="overview" projectID={projectID} />
				<div className="event-tab-content">
					{noOfRules === 0 && <div>
						<div className="panel">
							<img src={eventingSvg} />
							<p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>Trigger asynchronous business logic reliably on any events via the eventing queue in Space Cloud. <a href="https://docs.spaceuptech.com/microservices/eventing">View Docs.</a></p>
							<Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setRuleModalVisibile(true)} disabled={!eventingConfigured}>Add first event trigger</Button>
							{dbAlert()}
						</div>
					</div>}
					{noOfRules > 0 && (
						<React.Fragment>
							<div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
								<h3 style={{ margin: 'auto 0' }}>Event Triggers {filteredRulesData.length ? `(${filteredRulesData.length})` : ''}</h3>
								<div style={{ display: 'flex' }}>
									<Input.Search placeholder='Search by trigger name' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
									<Button style={{ marginLeft: '16px' }} onClick={() => setFilterModalVisible(true)}>Filter <FilterOutlined /></Button>
									<Button style={{ marginLeft: '16px' }} onClick={() => setRuleModalVisibile(true)} type="primary">Add</Button></div>
							</div>
							<Table
								columns={columns}
								dataSource={filteredRulesData}
								rowKey="id"
								locale={{
									emptyText: rulesTableData.length !== 0 ?
										<EmptySearchResults searchText={searchText} /> :
										<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No event trigger created yet. Add a event trigger' />
								}} />
						</React.Fragment>
					)}
					{ruleModalVisible && <RuleForm
						handleCancel={handleRuleModalCancel}
						handleSubmit={handleSetRule}
						dbList={dbList}
						initialValues={ruleClickedInfo} />}
					{filterModalVisible && <FilterEvents
						handleCancel={() => setFilterModalVisible(false)}
						handleSubmit={handleFilter}
						dbList={dbList}
						customEventTypes={customEventTypes}
						initialValues={filters} />}
				</div>
			</div>
		</div>
	)
}

export default EventingOverview;
