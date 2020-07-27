import React, { useState, useEffect } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { useParams } from "react-router-dom";
import { Button, Table, Popconfirm } from "antd";
import { useSelector } from 'react-redux';
import ReactGA from 'react-ga';
import { notify, getEventSourceFromType, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage } from '../../utils';
import EventTabs from "../../components/eventing/event-tabs/EventTabs";
import EventSecurityRuleForm from '../../components/eventing/EventSecurityRuleForm';
import securitySvg from '../../assets/security.svg';
import { deleteEventingSecurityRule, saveEventingSecurityRule, loadEventingSecurityRules, getEventingTriggerRules, getEventingSecurityRules, getEventingDefaultSecurityRule } from '../../operations/eventing';
import { securityRuleGroups, projectModules } from '../../constants';

const EventingRules = () => {
  const { projectID } = useParams()

  useEffect(() => {
    ReactGA.pageview("/projects/eventing/rules");
  }, [])

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

  // Derived state
  const customEventTypes = Object.entries(eventRules).filter(([key, value]) => getEventSourceFromType(value.type) === "custom").map(([_, value]) => value.type)
  delete rule.id;

  // Handlers
  const handleSubmit = (type, rule) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveEventingSecurityRule(projectID, type, rule)
        .then(() => {
          notify("success", "Success", "Added eventing security rule successfully")
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
        .then(() => {
          notify("success", "Success", "Deleted eventing security rule successfully")
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
      key: "type"
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
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>Security Rules <Button onClick={() => setAddRuleModalVisible(true)} type="primary">Add</Button></h3>
          {Object.keys(rules).length > 0 ? <Table dataSource={Object.keys(rules).map(val => ({ type: val }))} columns={columns} /> : <EmptyState />}
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