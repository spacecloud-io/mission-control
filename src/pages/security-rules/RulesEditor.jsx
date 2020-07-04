import React, { useState, useEffect } from 'react';
import './rules-editor.css';
import Topbar from '../../components/topbar/Topbar';
import { Tabs, Button, Drawer } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import { notify } from '../../utils';
import rabbit from '../../assets/rabbit.png';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Graph from 'react-graph-vis';
import { Alert, Dropdown, Menu } from 'antd';
import ConfigureRule from '../../components/security-rules/ConfigureRule';
import dotProp from 'dot-prop-immutable';
import {useParams} from 'react-router-dom';
import qs from 'qs';

const Keyboard = (props) => {
  return (
    <span style={{ backgroundColor: '#D9D9D9', padding: '5px 10px' }}>
      {props.children}
    </span>
  );
};

const RulesEditor = (props) => {

  const params = qs.parse(props.location.search, { ignoreQueryPrefix: true });
  const {moduleName, name, id, db} = params;

  const [shortcutsDrawer, openShortcutsDrawer] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [rule, setRule] = useState({});
  const [stringifiedRule, setStringifiedRule] = useState('');
  const [selectedRule, setSelectedRule] = useState({});
  const [selectedNodeId, setselectedNodeId] = useState();
  const [network, setNetwork] = useState();

  const nodes = [];
  const edges = [];

  useEffect(() => {
    setStringifiedRule(JSON.stringify(rule, null, 2));
  }, [rule]);

  const bc = new BroadcastChannel('builder');
  useEffect(() => {
    if (!window.data) return;
    setRule(window.data.rules);
  }, []);

  // And, or rule
  const nestedNodes = (clauses, parentId) => {
    for (let i = 0; i < clauses.length; i++) {
      const childId = `${parentId}.clauses.${i}`;
        nodes.push({
          id: childId,
          label: clauses[i].rule,
          ...clauses[i],
          group: 'rule',
        });
        edges.push({ from: parentId, to: childId });

        if (clauses[i].rule === 'or' || clauses[i].rule === 'and') {
          nestedNodes(clauses[i].clauses, childId);
        }
        if (clauses[i].rule === 'query' || clauses[i].rule === 'remove' || clauses[i].rule === 'force') {
          clauseNodes(clauses[i].clause, childId);
        }     
    }
    nodes.push({ id: `${parentId}.clauses.${clauses.length}`, label: '+ Add rule', group: 'add_rule' });
    edges.push({ from: parentId, to: `${parentId}.clauses.${clauses.length}` });
  };

  // query, remove
  const clauseNodes = (clause, parentId) => {
    const childId = `${parentId}.clause`;
    if (clause && clause.rule) {
      nodes.push({ id: childId, label: clause.rule, group: 'rule' });
      edges.push({ from: parentId, to: childId });
      if (clause.rule === 'and' || clause.rule === 'or') {
        nestedNodes(clause.clauses, childId);
      }
    } else {
      nodes.push({ id: childId, label: '+ Add rule', group: 'add_rule' });
      edges.push({ from: parentId, to: childId });
    }
  };

  // Map rules into nodes and edges
  if (!["remote-service", "routing", "eventing", "prepared-queries"].includes(moduleName)) nodes.push({ id: name, label: name, group: 'crud' });
    Object.entries(rule).map(([key, value]) => {
      if (Object.keys(value).length === 0) {
        nodes.push({ id: `${key}Rule`, label: key, group: 'no_rule_crud' });
        nodes.push({ id: key, label: '+ Add rule', group: 'add_rule' });
      } else {
        nodes.push({ id: `${key}Rule`, label: key, group: 'crud' });
        nodes.push({ id: key, label: value.rule, group: 'rule', ...value });
      }
      edges.push({ from: name, to: `${key}Rule` });
      edges.push({ from: `${key}Rule`, to: key });
  
      if (value.rule === 'query' || value.rule === 'remove' || value.rule === 'force') {
        clauseNodes(value.clause, key);
      }
  
      if (value.rule === 'or' || value.rule === 'and') {
        nestedNodes(value.clauses, key);
      }
    });

  // vis.js configurations
  const graph = {
    nodes: [...nodes],
    edges: [...edges],
  };

  const options = {
    groups: {
      no_rule_crud: {
        color: {
          border: '#F0F0F0',
          background: 'white',
        },
      },
      crud: {
        color: '#90EE90',
      },
      rule: {
        borderWidth: 1,
        color: {
          border: '#F0F0F0',
          background: 'white',
        },
        shapeProperties: {
          borderDashes: false,
          borderRadius: 0,
        },
      },
      add_rule: {
        borderWidth: 2,
        color: {
          border: 'rgba(0, 0, 0, 0.25)',
        },
        shapeProperties: {
          borderDashes: [2, 2],
          borderRadius: 4,
        },
      },
    },
    nodes: {
      shape: 'box',
      shapeProperties: {
        borderRadius: 0,
      },
      color: {
        border: '#F0F0F0',
        background: 'white',
      },
      font: {
        size: 16,
      },
      heightConstraint: 54,
      widthConstraint: {
        minimum: 54,
      },
    },
    edges: {
      arrows: {
        to: {
          enabled: false,
        },
      },
      color: '#000000',
      arrowStrikethrough: true,
      physics: false,
    },
    layout: {
      hierarchical: {
        enabled: true,
        parentCentralization: false,
        sortMethod: 'directed',
        direction: 'LR',
        nodeSpacing: 200,
      },
    },
    interaction: {
      dragNodes: false,
    },
    height: '450px',
  };

  // mouse events handlers
  const events = {
    oncontext: (event) => {
      const position = event.pointer.DOM;
      const nodeId = network.getNodeAt(position);
      if (nodeId) network.selectNodes([nodeId], false);
      console.log("Rule", rule);
      console.log("Nodes", nodes);
    },
    select: (event) => {
      const node = event.nodes[0];
      if (node) setselectedNodeId(node);
    },
    doubleClick: function (event) {
      const nodeId = event.nodes[0];
      setselectedNodeId(nodeId);
      setSelectedRule(dotProp.get(rule, nodeId));
      setDrawer(true);
    },
  };

  // shortcut events handler
  const shortcutsHandler = (key) => {
    if (!selectedNodeId) return;

    if (key === 'del') {
      if (["createRule", "updateRule", "readRule", "deleteRule"].includes(selectedNodeId)) {
        return;
      }
      if (["create", "update", "read", "delete"].includes(selectedNodeId)) {
        setRule(dotProp.set(rule, selectedNodeId, {}))
      }
      else {
        setRule(dotProp.delete(rule, selectedNodeId));
      }
    } 

    else if (key === 'ctrl+c') {
      const copiedRule = Object.assign({}, dotProp.get(rule, selectedNodeId));
      if (copiedRule.clauses) copiedRule.clauses = [];
      else if (copiedRule.clause) copiedRule.clause = {};
      console.log(copiedRule);
      setSelectedRule(copiedRule);
    } 

    else if (key === 'ctrl+alt+c') {
      setSelectedRule(dotProp.get(rule, selectedNodeId));
    } 

    else if (key === 'ctrl+x') {
      setSelectedRule(dotProp.get(rule, selectedNodeId));
      setRule(dotProp.set(rule, selectedNodeId, {}));
    } 

    else if (Object.keys(selectedRule).length === 0) return;
    
    else if (key === 'alt+r') {
      setRule(dotProp.set(rule, selectedNodeId, selectedRule));
    } 
    
    else if (key === 'ctrl+v') {

      const ruleObj = dotProp.get(rule, selectedNodeId);
      if (["createRule", "updateRule", "readRule", "deleteRule"].includes(selectedNodeId)) {
        setRule(dotProp.set(rule, selectedNodeId.split("Rule")[0], selectedRule));
      }
      else if (ruleObj.rule === 'query' || ruleObj.rule === "remove" || ruleObj.rule === "force") {
        const childId = `${selectedNodeId}.clause`;
        const child = nodes.find((val) => val.id === childId);
        if (child.group === 'add_rule') {
          setRule(dotProp.set(rule, childId, selectedRule));
        }
      }
      else if (ruleObj.rule === 'and' || ruleObj.rule === 'or') {
        for (let i = 0; i <= ruleObj.clauses.length; i++) {
          const childId = `${selectedNodeId}.clauses.${i}`;
          const child = nodes.find((val) => val.id === childId);
          if (child.group === 'add_rule') {
            setRule(dotProp.set(rule, childId, selectedRule));
            break;
          }
        }
      }
    }
  };

  const tab = localStorage.getItem('rules:editor')
  ? localStorage.getItem('rules:editor')
  : 'builder';

const onTabChange = (tab) => {
  try {
    const parsedRule = JSON.parse(stringifiedRule);
    localStorage.setItem('rules:editor', tab);
    setRule(parsedRule);
  } catch (ex) {
    notify("error", "Error", ex.toString());
  }
};

// Prettify JSON code
const prettify = () => {
  try {
    const obj = JSON.parse(stringifiedRule);
    setStringifiedRule(JSON.stringify(obj, null, 2));
  } catch (ex) {
    notify('error', 'Error', ex.toString());
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

  // On drawer form submit
const onSubmit = (values) => {
  setRule(dotProp.set(rule, selectedNodeId, values));
};

const onSaveChanges = (tab) => {
  const message= {
    module: moduleName,
    name: name,
    id: id,
    db: db
  }
  if (tab === "builder") {
    bc.postMessage({...message, rules: rule})
  } else {
    try {
      const parsedJSON = JSON.parse(stringifiedRule);
      bc.postMessage({...message, rules: parsedJSON})
    } catch (ex) {
      notify("error", "Error", ex.toString())
      return;
    }
  }
  window.close();
  console.log(rule);
}


  const menu = (
    <Menu onClick={({ key }) => shortcutsHandler(key)}>
      <Menu.Item key='ctrl+c'>Copy</Menu.Item>
      <Menu.Item key='ctrl+alt+c'>Copy with children</Menu.Item>
      <Menu.Item key='ctrl+x'>Cut</Menu.Item>
      <Menu.Item key='ctrl+v'>Paste</Menu.Item>
      <Menu.Item key='alt+r'>Replace</Menu.Item>
      <Menu.Item key='del'>Delete</Menu.Item>
    </Menu>
  );

  return (
    <React.Fragment>
      <KeyboardEventHandler
        handleKeys={['ctrl+/']}
        onKeyEvent={(key) => openShortcutsDrawer(!shortcutsDrawer)}
      />
      <Topbar />
      {Object.keys(rule).length > 0 && (
        <div className='editor-page'>
          <Tabs defaultActiveKey={tab} activeKey={localStorage.getItem("rules:editor")} onChange={onTabChange} animated={false}>
            <Tabs.TabPane
              tab='Builder'
              key='builder'
              style={{ padding: '16px 32px 32px' }}
            >
              <div style={{ marginBottom: 28 }}>
                <b>Security rules</b> ({name})
                <span style={{ float: 'right' }}>
                  <Button
                    style={{ marginRight: 16 }}
                    onClick={() => openShortcutsDrawer(true)}
                  >
                    Shortcuts
                  </Button>
                  <Button>
                    Documentation
                    <LinkOutlined />
                  </Button>
                </span>
              </div>
              <div>
                <Dropdown overlay={menu} trigger={['contextMenu']}>
                  <KeyboardEventHandler
                    handleKeys={[
                      'ctrl+c',
                      'ctrl+alt+c',
                      'ctrl+v',
                      'ctrl+h',
                      'del',
                      'ctrl+x',
                      'alt+r',
                    ]}
                    onKeyEvent={shortcutsHandler}
                  >
                    <Graph
                      graph={graph}
                      options={options}
                      events={events}
                      getNetwork={(network) => {
                        setNetwork(network);
                      }}
                    />
                    {!localStorage.getItem('builderHelp:closed') && (
                      <Alert
                        description='You can double click on a rule block to configure it or right click on it for more options.'
                        type='warning'
                        closable
                        style={{
                          width: 400,
                          position: 'absolute',
                          right: 45,
                          bottom: 100,
                          background: '#F0F0F0',
                          border: '1px solid #EEEEEE',
                        }}
                        afterClose={() =>
                          localStorage.setItem('builderHelp:closed', true)
                        }
                      />
                    )}
                  </KeyboardEventHandler>
                </Dropdown>
                {drawer && selectedRule ? (
                  <ConfigureRule
                    selectedRule={selectedRule}
                    closeDrawer={() => setDrawer(false)}
                    drawer={drawer}
                    onSubmit={onSubmit}
                  />
                ) : (
                  <></>
                )}
                <Button type='primary' onClick={() => onSaveChanges("builder")} style={{ width: '100%', marginTop: 24 }}>
                  Save
                </Button>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab='JSON'
              key='JSON'
              style={{ padding: '16px 32px 32px' }}
            >
              <div style={{ marginBottom: 28 }}>
                <b>Security rules</b> ({name})
                <span style={{ float: 'right' }}>
                  <Button style={{ marginRight: 16 }} onClick={prettify}>
                    Prettify
                  </Button>
                  <Button>
                    Documentation
                    <LinkOutlined />
                  </Button>
                </span>
              </div>
              <div style={{ border: '1px solid #D9D9D9' }}>
                <CodeMirror
                  style={{ border: '1px solid #D9D9D9' }}
                  value={stringifiedRule}
                  options={{
                    mode: { name: 'javascript', json: true },
                    lineNumbers: true,
                    styleActiveLine: true,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                    tabSize: 2,
                    autofocus: true,
                  }}
                  onBeforeChange={(editor, data, value) => {
                    setStringifiedRule(value);
                  }}
                />
              </div>
              <Button type='primary' onClick={() => onSaveChanges("json")} style={{ width: '100%', marginTop: 24 }}>
                Save
              </Button>
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
      {Object.keys(rule).length === 0 && (
        <>
          <div style={{ marginBottom: 28, marginTop: 80, padding: '0px 32px' }}>
            <b>Security rules</b> ({name})
            <span style={{ float: 'right' }}>
              <Button
                style={{ marginRight: 16 }}
                onClick={() => openShortcutsDrawer(true)}
              >
                Shortcuts
              </Button>
              <Button>
                Documentation
                <LinkOutlined />
              </Button>
            </span>
          </div>
          <div className='rabbit'>
            <img src={rabbit} alt='rabbit.png' />
            <p style={{ margin: '30px 0px' }}>
              No rules defined for this table yet. Default rules are being
              applied.
            </p>
            <Button onClick={addDefaultSecurityRules} type='primary' size='large'>
              Add security rules
            </Button>
          </div>
        </>
      )}
      {shortcutsDrawer && (
        <Drawer
          title='Configure rule'
          placement='right'
          onClose={() => openShortcutsDrawer(false)}
          visible={shortcutsDrawer}
          width={400}
        >
          <div className='shortcut-tip'>
            <Keyboard>Ctrl</Keyboard> + <Keyboard>C</Keyboard> Copy the selected
            rule
          </div>
          <div className='shortcut-tip'>
            <Keyboard>Ctrl</Keyboard> + <Keyboard>Alt</Keyboard> +{' '}
            <Keyboard>C</Keyboard> Copy the selected rule and its children
          </div>
          <div className='shortcut-tip'>
            <Keyboard>Ctrl</Keyboard> + <Keyboard>V</Keyboard> Paste the copied
            rule on any selected AND/OR rule
          </div>
          <div className='shortcut-tip'>
            <Keyboard>Alt</Keyboard> + <Keyboard>R</Keyboard> Replace the
            selected rule with the copied rule
          </div>
          <div className='shortcut-tip'>
            <Keyboard>Delete</Keyboard> Delete the selected rule
          </div>
          <div className='shortcut-tip'>
            <Keyboard>Ctrl</Keyboard> + <Keyboard>X</Keyboard> Cut along with
            children
          </div>
        </Drawer>
      )}
    </React.Fragment>
  );
};

export default RulesEditor;
