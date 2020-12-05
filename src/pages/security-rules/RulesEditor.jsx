import React, { useState } from 'react';
import './rules-editor.css';
import Topbar from '../../components/topbar/Topbar';
import { Tabs, Button, Tooltip } from 'antd';

import { notify, decrementPendingRequests, incrementPendingRequests } from '../../utils';
import rabbit from '../../assets/rabbit.png';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import ShortcutsDrawer from "../../components/security-rules/shortcuts-drawer/ShortcutsDrawer"

import { useParams, useLocation } from 'react-router-dom';
import qs from 'qs';
import { useSelector } from 'react-redux';
import DocumentationButton from "../../components/security-rules/documentation-button/DocumentationButton";
import GraphEditor from "../../components/security-rules/graph-editor/GraphEditor";
import JSONEditor from "../../components/security-rules/json-editor/JSONEditor";
import useDeepCompareEffect from 'use-deep-compare-effect';
import { getSecurityRuleInfo, loadSecurityRules, saveSecurityRule } from '../../operations/securityRuleBuilder';
import { securityRuleGroups, defaultDBRules, defaultPreparedQueryRule, defaultEventRule, defaultFileRule, defaultEndpointRule, defaultIngressRoutingRule, actionQueuedMessage, defaultEventFilterRule } from '../../constants';
import { getCacheConfig } from '../../operations/cache';

const RulesEditor = () => {
  // Router params
  const { projectID } = useParams();
  const location = useLocation()
  const ruleMetaData = qs.parse(location.search, { ignoreQueryPrefix: true });
  const { ruleType, id, group } = ruleMetaData

  // Global state 
  const { rule: initialRule, name } = useSelector(state => getSecurityRuleInfo(state, ruleType, id, group))
  const tab = localStorage.getItem('rules:editor') ? localStorage.getItem('rules:editor') : 'builder';
  const cacheConfig = useSelector(state => getCacheConfig(state))

  // Component state
  const [shortcutsDrawer, openShortcutsDrawer] = useState(false);
  const [rule, setRule] = useState(initialRule);
  const initialRuleStringified = JSON.stringify(initialRule, null, 2)
  const [stringifiedRule, setStringifiedRule] = useState(initialRuleStringified);
  const [activeTab, setActiveTab] = useState(tab)

  // Derived state
  const ruleExists = Object.keys(rule).length > 0
  const rulesChanged = activeTab === "builder" ? JSON.stringify(initialRule) !== JSON.stringify(rule) : stringifiedRule !== initialRuleStringified
  const defaultRulesPossible = ruleType === securityRuleGroups.DB_COLLECTIONS || ruleType === securityRuleGroups.DB_PREPARED_QUERIES

  useDeepCompareEffect(() => {
    setRule(initialRule)
  }, [initialRule])

  useDeepCompareEffect(() => {
    setStringifiedRule(JSON.stringify(rule, null, 2));
  }, [rule]);

  useDeepCompareEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecurityRules(projectID, ruleMetaData.ruleType, ruleMetaData.id)
        .catch(ex => notify("error", "Error fetching rule", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID, ruleMetaData])

  const onTabChange = (tab) => {
    try {
      const parsedRule = JSON.parse(stringifiedRule);
      localStorage.setItem('rules:editor', tab);
      setRule(parsedRule);
      setActiveTab(tab)
    } catch (ex) {
      notify("error", "Error", ex.toString());
    }
  };

  const addDefaultSecurityRules = () => {
    switch (ruleType) {
      case securityRuleGroups.DB_COLLECTIONS:
        setRule(defaultDBRules)
        break;
      case securityRuleGroups.DB_PREPARED_QUERIES:
        setRule(defaultPreparedQueryRule)
        break;
      case securityRuleGroups.EVENTING:
        setRule(defaultEventRule)
        break;
      case securityRuleGroups.EVENTING_FILTERS:
        setRule(defaultEventFilterRule)
        break;
      case securityRuleGroups.FILESTORE:
        setRule(defaultFileRule)
        break;
      case securityRuleGroups.REMOTE_SERVICES:
        setRule(defaultEndpointRule)
        break;
      case securityRuleGroups.INGRESS_ROUTES:
        setRule(defaultIngressRoutingRule)
        break;
    }
  }

  // On save rule
  const onSaveChanges = (tab) => {
    try {
      incrementPendingRequests()
      const rules = tab === "builder" ? rule : JSON.parse(stringifiedRule);
      saveSecurityRule(projectID, ruleType, id, group, rules)
        .then(() => {
          if (window.opener && !window.opener.closed) {
            window.opener.focus()
            window.close()
          }
        })
        .catch(ex => notify("error", "Error saving rules", ex))
        .finally(() => decrementPendingRequests())
    } catch (ex) {
      decrementPendingRequests()
      notify("error", "Error", ex)
      return;
    }
  }

  const handleUseDefaultRules = () => {
    incrementPendingRequests()
    saveSecurityRule(projectID, ruleType, id, group, {})
      .then(({ queued }) => {
        if (!queued) {
          setRule({})
          return
        }
        notify("success", "Success", actionQueuedMessage)
      })
      .catch(ex => notify("error", "Error using default rules", ex))
      .finally(() => decrementPendingRequests())
  }

  // Prettify JSON code
  const prettify = () => {
    try {
      const obj = JSON.parse(stringifiedRule);
      setStringifiedRule(JSON.stringify(obj, null, 2));
    } catch (ex) {
      notify('error', 'Error', ex.toString());
    }
  };

  const UseDefaultRulesButton = () => {
    if (!defaultRulesPossible) {
      return (
        <Tooltip title="Default rules work only for database" >
          <Button style={{ marginRight: 16 }} disabled>Use default rules</Button>
        </Tooltip>
      )
    }
    return <Button onClick={handleUseDefaultRules} style={{ marginRight: 16 }}>Use default rules</Button>
  }

  return (
    <React.Fragment>
      <KeyboardEventHandler
        handleKeys={['ctrl+/']}
        onKeyEvent={(key) => openShortcutsDrawer(!shortcutsDrawer)}
      />
      <Topbar />
      <div className='editor-page'>
        {ruleExists && (
          <Tabs defaultActiveKey={tab} activeKey={activeTab} onChange={onTabChange} style={{ height: "100%" }}>
            <Tabs.TabPane tab='Builder' key='builder' >
              <React.Fragment>
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                    <span><b>Rules</b> ({name})</span>
                    <span>
                      <UseDefaultRulesButton />
                      <Button onClick={() => openShortcutsDrawer(true)} style={{ marginRight: 16 }}>Shortcuts</Button>
                      <DocumentationButton />
                    </span>
                  </div>
                  <div className="rule-editor-holder" style={{ height: "calc(100% - 104px)", border: '1px solid #D9D9D9' }}>
                    <GraphEditor rule={rule} setRule={setRule} ruleName={name} ruleMetaData={ruleMetaData} isCachingEnabled={cacheConfig.enabled} />
                  </div>
                  <Button type='primary' size="large" onClick={() => onSaveChanges("builder")} block style={{ marginTop: 16 }} disabled={!rulesChanged}>Save</Button>
                </div>
              </React.Fragment>
            </Tabs.TabPane>
            <Tabs.TabPane tab='JSON' key='JSON' >
              <React.Fragment>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                  <span><b>Rules</b> ({name})</span>
                  <span>
                    <UseDefaultRulesButton />
                    <Button style={{ marginRight: 16 }} onClick={prettify}>Prettify</Button>
                    <DocumentationButton />
                  </span>
                </div>
                <div className="rule-editor-holder" style={{ height: "calc(100% - 104px)", border: '1px solid #D9D9D9' }} >
                  <JSONEditor rule={stringifiedRule} setRule={setStringifiedRule} />
                </div>
                <Button type='primary' size="large" onClick={() => onSaveChanges("json")} block style={{ marginTop: 16 }} disabled={!rulesChanged}>Save</Button>
              </React.Fragment>
            </Tabs.TabPane>
          </Tabs>
        )}
        {!ruleExists && (
          <div style={{ padding: 32 }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
              <span><b>Rules</b> ({name})</span>
              <DocumentationButton />
            </div>
            <div className='rabbit'>
              <img src={rabbit} alt='rabbit.png' />
              <p style={{ margin: '30px 0px' }}>No rules defined yet. {defaultRulesPossible ? "Default rules are being applied." : "Define rules for the resource."}</p>
              <Button onClick={addDefaultSecurityRules} type='primary' size='large'>Add rules</Button>
            </div>
          </div>
        )}
        {shortcutsDrawer && <ShortcutsDrawer onClose={() => openShortcutsDrawer(false)} />}
      </div>
    </React.Fragment>
  );
};

export default RulesEditor;