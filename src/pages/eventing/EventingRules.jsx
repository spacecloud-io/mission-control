import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import { Button, Table, Popconfirm, Input, Empty } from "antd";
import { useSelector } from 'react-redux';
import { notify, getEventSourceFromType, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../utils';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import EventSecurityRuleForm from '../../components/eventing/EventSecurityRuleForm';
import securitySvg from '../../assets/security.svg';
import { deleteEventingSecurityRule, saveEventingSecurityRule, loadEventingSecurityRules, getEventingTriggerRules, getEventingSecurityRules, getEventingDefaultSecurityRule } from '../../operations/eventing';
import { securityRuleGroups, projectModules, actionQueuedMessage } from '../../constants';
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

const EventingRules = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadEventingSecurityRules(projectID)
        .catch(ex => notify("error", "Error fetching eventing rules", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  // Global state
  const rule = useSelector(state => getEventingDefaultSecurityRule(state))
  const rules = useSelector(state => getEventingSecurityRules(state))
  const eventRules = useSelector(state => getEventingTriggerRules(state))

  // Component state
  const [addRuleModalVisible, setAddRuleModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Derived state
  const customEventTypes = Object.entries(eventRules).filter(([key, value]) => getEventSourceFromType(value.type) === "custom").map(([_, value]) => value.type)
  delete rule.id;
  const rulesTableData = Object.keys(rules).map(val => ({ type: val }));

  const filteredRulesData = rulesTableData.filter(rule => {
    return rule.type.toLowerCase().includes(searchText.toLowerCase())
  })

  // Handlers
  const handleSubmit = (type, rule) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveEventingSecurityRule(projectID, type, rule)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Added eventing security rule successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error adding eventing security rule", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }


  const handleDeleteRule = (type) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      deleteEventingSecurityRule(projectID, type)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Deleted eventing security rule successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error deleting eventing security rule", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  const handleSecureClick = id => openSecurityRulesPage(projectID, securityRuleGroups.EVENTING, id)

  const EmptyState = () => {
    return <div style={{ marginTop: 24 }}>
      <div className="panel">
        <img src={securitySvg} width="240px" />
        <p className="panel__description" style={{ marginTop: 32, marginBottom: 0 }}>Secruity rules helps you restrict access to your data.</p>
      </div>
    </div>
  }

  const columns = [
    {
      title: "Event type",
      dataIndex: "type",
      key: "type",
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
      title: "Actions",
      key: "actions",
      className: "column-actions",
      render: (_, record) => (
        <span>
          <a onClick={() => handleSecureClick(record.type)}>Secure</a>
          <Popconfirm title={`Are you sure you want to delete this rule?`} onConfirm={() => handleDeleteRule(record.type)}>
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
        </span>
      )
    }
  ]

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.EVENTING} />
      <div className='page-content page-content--no-padding'>
        <EventTabs activeKey="rules" projectID={projectID} />
        <div className="event-tab-content">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
          <h3 style={{ margin: 'auto 0' }}>Security Rules {filteredRulesData.length ? `(${filteredRulesData.length})` : ''}</h3>
            <div style={{ display: 'flex' }}>
              <Input.Search placeholder='Search by event type' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button style={{ marginLeft: '16px' }} onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button>
            </div>
          </div>
          {Object.keys(rules).length > 0 ?
            <Table
              dataSource={filteredRulesData}
              columns={columns}
              locale={{
                emptyText: rulesTableData.length !== 0 ?
                  <EmptySearchResults searchText={searchText} /> :
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No event rule created yet. Add a event rule' />
              }}
            /> : <EmptyState />}
          {addRuleModalVisible && <EventSecurityRuleForm
            defaultRules={rule}
            handleSubmit={handleSubmit}
            customEventTypes={customEventTypes}
            handleCancel={() => setAddRuleModalVisible(false)} />}
        </div>
      </div>

    </div>
  )
}

export default EventingRules;