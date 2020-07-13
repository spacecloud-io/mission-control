import React, { useState } from "react";
import { Menu, Dropdown, Alert } from "antd"
import dotProp from 'dot-prop-immutable';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import ConfigureRule from '../configure-rule/ConfigureRule';
import SecurityRulesGraph from "../security-rules-graph/SecurityRulesGraph";
import { securityRuleGroups } from "../../../constants"
const { DB_PREPARED_QUERIES, REMOTE_SERVICES, INGRESS_ROUTES, EVENTING } = securityRuleGroups

function GraphEditor({ rule, setRule, ruleName, ruleMetaData }) {
  const [drawer, setDrawer] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});
  const [selectedNodeId, setselectedNodeId] = useState();
  const [network, setNetwork] = useState();

  const nodes = [];
  const edges = [];

  const { ruleType, id, group } = ruleMetaData
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

  // query, remove, force
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
  if (![REMOTE_SERVICES, INGRESS_ROUTES, EVENTING, DB_PREPARED_QUERIES].includes(ruleType)) nodes.push({ id: ruleName, label: ruleName, group: 'crud' });
  Object.entries(rule).map(([key, value]) => {
    if (Object.keys(value).length === 0) {
      nodes.push({ id: `${key}Rule`, label: key, group: 'no_rule_crud' });
      nodes.push({ id: key, label: '+ Add rule', group: 'add_rule' });
    } else {
      nodes.push({ id: `${key}Rule`, label: key, group: 'crud' });
      nodes.push({ id: key, label: value.rule, group: 'rule', ...value });
    }
    edges.push({ from: ruleName, to: `${key}Rule` });
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

  // mouse events handlers
  const events = {
    oncontext: (event) => {
      const position = event.pointer.DOM;
      const nodeId = network.getNodeAt(position);
      if (nodeId) network.selectNodes([nodeId], false);
    },
    select: (event) => {
      const node = event.nodes[0];
      if (!node) return;
      setselectedNodeId(node);
      const group = nodes.find(val => val.id === node).group;
      if (group === "add_rule") {
        setSelectedRule({});
        setDrawer(true);
      }
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

  // On drawer form submit
  const onSubmit = (values) => {
    setRule(dotProp.set(rule, selectedNodeId, values));
  };

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
          <SecurityRulesGraph graph={graph} events={events} setNetwork={setNetwork} />
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
      {drawer && selectedRule && (
        <ConfigureRule
          selectedRule={selectedRule}
          closeDrawer={() => setDrawer(false)}
          drawer={drawer}
          ruleMetaData={ruleMetaData}
          onSubmit={onSubmit}
          selectedNodeId={selectedNodeId.split(".")[0]}
        />
      )}
    </React.Fragment>
  )
}

export default GraphEditor;