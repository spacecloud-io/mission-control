import React, { useState, useEffect } from 'react';
import './rules-editor.css';
import Topbar from '../../components/topbar/Topbar';
import { Tabs, Button } from 'antd';

import { notify } from '../../utils';
import rabbit from '../../assets/rabbit.png';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import ShortcutsDrawer from "../../components/security-rules/shortcuts-drawer/ShortcutsDrawer"

import { useParams } from 'react-router-dom';
import qs from 'qs';
import { useSelector } from 'react-redux';
import DocumentationButton from "../../components/security-rules/documentation-button/DocumentationButton";
import GraphEditor from "../../components/security-rules/graph-editor/GraphEditor";
import JSONEditor from "../../components/security-rules/json-editor/JSONEditor";

const RulesEditor = (props) => {

  // Router params
  const { projectID } = useParams();
  const params = qs.parse(props.location.search, { ignoreQueryPrefix: true });
  const { moduleName, name, id, db, serviceName } = params;

  const tab = localStorage.getItem('rules:editor') ? localStorage.getItem('rules:editor') : 'builder';

  // Component state
  const [shortcutsDrawer, openShortcutsDrawer] = useState(false);
  const [rule, setRule] = useState({});
  const [stringifiedRule, setStringifiedRule] = useState('');
  const projects = useSelector(state => state.projects);

  const ruleExists = Object.keys(rule).length > 0

  useEffect(() => {
    setStringifiedRule(JSON.stringify(rule, null, 2));
  }, [rule]);

  const bc = new BroadcastChannel('builder');
  useEffect(() => {
    if (!window.data) return;
    setRule(window.data.rules);
  }, []);

  useEffect(() => {
    // if (projects.length > 0 && !window.data) {
    //   switch (moduleName) {
    //     case "database":
    //       setRule(getProjectConfig(projects, projectID, `modules.db.${db}.collections.${name}.rules`, {}))
    //       break;
    //     case "prepared-queries":
    //       const preparedQueryRule = getProjectConfig(projects, projectID, `modules.db.${db}.preparedQueries.${name}.rule`, {});
    //       setRule({ [name]: { ...preparedQueryRule } })
    //       break;
    //     case "file-storage":
    //       const fileStoreRules = getProjectConfig(projects, projectID, `modules.fileStore.rules`, []);
    //       setRule(fileStoreRules.find(val => val.id === name).rule)
    //       break;
    //     case "remote-service":
    //       const endpointRule = getProjectConfig(projects, projectID, `modules.remoteServices.externalServices.${serviceName}.endpoints.${name}.rule`, {});
    //       setRule({ [name]: { ...endpointRule } })
    //       break;
    //     case "routing":
    //       const routes = getProjectConfig(projects, projectID, `modules.ingressRoutes`, [])
    //       const routeRule = routes.find(val => val.id === id).rule;
    //       setRule({ [name]: { ...routeRule } })
    //       break;
    //     case "eventing":
    //       const eventingRule = getProjectConfig(projects, projectID, `modules.eventing.securityRules.${name}`)
    //       if (!eventingRule) return;
    //       setRule({ [name]: { ...eventingRule } })
    //       break;
    //     default:
    //       break;
    //   }
    // }
  }, [projects])

  const onTabChange = (tab) => {
    try {
      const parsedRule = JSON.parse(stringifiedRule);
      localStorage.setItem('rules:editor', tab);
      setRule(parsedRule);
    } catch (ex) {
      notify("error", "Error", ex.toString());
    }
  };

  const addDefaultSecurityRules = () => {
    setRule({
      create: {
        rule: "allow"
      },
      read: {
        rule: "allow"
      },
      update: {
        rule: "allow"
      },
      delete: {
        rule: "allow"
      }
    })
  }

  // On save rule
  const onSaveChanges = (tab) => {
    const message = {
      module: moduleName,
      name: name,
      id: id,
      db: db
    }
    if (tab === "builder") {
      bc.postMessage({ ...message, rules: rule })
    } else {
      try {
        const parsedJSON = JSON.parse(stringifiedRule);
        bc.postMessage({ ...message, rules: parsedJSON })
      } catch (ex) {
        notify("error", "Error", ex.toString())
        return;
      }
    }
    window.close();
    console.log(rule);
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

  return (
    <React.Fragment>
      <KeyboardEventHandler
        handleKeys={['ctrl+/']}
        onKeyEvent={(key) => openShortcutsDrawer(!shortcutsDrawer)}
      />
      <Topbar />
      <div className='editor-page'>
        {ruleExists && (
          <Tabs defaultActiveKey={tab} onChange={onTabChange} style={{ height: "100%" }}>
            <Tabs.TabPane tab='Builder' key='builder' >
              <React.Fragment>
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                    <span><b>Security rules</b> ({name})</span>
                    <span>
                      <Button onClick={() => openShortcutsDrawer(true)} style={{ marginRight: 16 }}>Shortcuts</Button>
                      <DocumentationButton />
                    </span>
                  </div>
                  <div className="rule-editor-holder" style={{ height: "calc(100% - 104px)", border: '1px solid #D9D9D9' }}>
                    <GraphEditor moduleName={moduleName} rule={rule} setRule={setRule} ruleName={name} params={params} />
                  </div>
                  <Button type='primary' size="large" onClick={() => onSaveChanges("builder")} block style={{ marginTop: 16 }}>Save</Button>
                </div>
              </React.Fragment>
            </Tabs.TabPane>
            <Tabs.TabPane tab='JSON' key='JSON' >
              <React.Fragment>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                  <span><b>Security rules</b> ({name})</span>
                  <span>
                    <Button style={{ marginRight: 16 }} onClick={prettify}>Prettify</Button>
                    <DocumentationButton />
                  </span>
                </div>
                <div className="rule-editor-holder" style={{ height: "calc(100% - 104px)", border: '1px solid #D9D9D9' }} >
                  <JSONEditor rule={stringifiedRule} setRule={setStringifiedRule} />
                </div>
                <Button type='primary' size="large" onClick={() => onSaveChanges("json")} block style={{ marginTop: 16 }}>Save</Button>
              </React.Fragment>
            </Tabs.TabPane>
          </Tabs>
        )}
        {!ruleExists && (
          <div style={{ padding: 32 }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
              <span><b>Security rules</b> ({name})</span>
              <DocumentationButton />
            </div>
            <div className='rabbit'>
              <img src={rabbit} alt='rabbit.png' />
              <p style={{ margin: '30px 0px' }}>No rules defined yet. Default rules are being applied.</p>
              <Button onClick={addDefaultSecurityRules} type='primary' size='large'>Add security rules</Button>
            </div>
          </div>
        )}
        {shortcutsDrawer && <ShortcutsDrawer onClose={() => openShortcutsDrawer(false)} />}
      </div>
    </React.Fragment>
  );
};

export default RulesEditor;