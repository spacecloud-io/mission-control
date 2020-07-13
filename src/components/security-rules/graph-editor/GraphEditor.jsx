import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Alert } from "antd"
import dotProp from 'dot-prop-immutable';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import ConfigureRule from '../configure-rule/ConfigureRule';
import SecurityRulesGraph from "../security-rules-graph/SecurityRulesGraph";
import { securityRuleGroups } from "../../../constants"
import { notify } from "../../../utils";
const { DB_COLLECTIONS, FILESTORE } = securityRuleGroups

const mergeGraph = (graph1, graph2) => {
  const nodes = [...graph1.nodes, ...graph2.nodes]
  const edges = [...graph1.edges, ...graph2.edges]
  return { nodes, edges }
}
const convertRuleToGraph = (rule, id, parentId) => {
  let graph = { nodes: [], edges: [] }

  const isRootBlock = !parentId.includes(".")
  if (!rule || !rule.rule) {
    if (isRootBlock) {
      // Add a block to add rule
      graph.nodes.push({ id: `${parentId}.add_rule`, label: "+ Add rule", group: "add_rule" })
      graph.edges.push({ from: parentId, to: `${parentId}.add_rule` })
    }
    return graph
  }

  graph.nodes.push({ id: id, label: rule.rule, group: "rule" })
  graph.edges.push({ from: parentId, to: id })

  if (rule.rule === "and" || rule.rule === "or") {
    if (rule.clauses) {
      rule.clauses.forEach((clause, index) => {
        graph = mergeGraph(graph, convertRuleToGraph(clause, `${id}.clauses.${index}`, id))
      })
    }
    const len = rule.clauses ? rule.clauses.length : 0
    graph.nodes.push({ id: `${id}.clauses.${len}`, label: "+ Add clause", group: "add_rule" })
    graph.edges.push({ from: id, to: `${id}.clauses.${len}` })
  }
  if (rule.rule === "query" || rule.rule === "force" || rule.rule === "remove") {
    if (rule.clause && rule.clause.rule) {
      graph = mergeGraph(graph, convertRuleToGraph(rule.clause, `${id}.clause`, id))
    } else {
      graph.nodes.push({ id: `${id}.add_rule`, label: "Set clause", group: "add_rule" })
      graph.edges.push({ from: id, to: `${id}.add_rule` })
    }
  }
  return graph
}

function GraphEditor({ rule, setRule, ruleName, ruleMetaData }) {
  const [drawer, setDrawer] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});
  const [selectedNodeId, setselectedNodeId] = useState();
  const [network, setNetwork] = useState();

  useEffect(() => {
    function handleResize() {
      if (network) {
        network.redraw()
        network.fit()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [network])

  const { ruleType, id } = ruleMetaData

  const nodes = []
  const edges = []

  nodes.push({ id: "root", label: ruleName, group: "root" })

  switch (ruleType) {
    case DB_COLLECTIONS:
      nodes.push({ id: "root:create", label: "create", group: rule.create ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:create" })
      const dbCreateGraph = convertRuleToGraph(rule.create, "create", "root:create")
      nodes.push(...dbCreateGraph.nodes)
      edges.push(...dbCreateGraph.edges)

      nodes.push({ id: "root:read", label: "read", group: rule.read ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:read" })
      const dbReadGraph = convertRuleToGraph(rule.read, "read", "root:read")
      nodes.push(...dbReadGraph.nodes)
      edges.push(...dbReadGraph.edges)

      nodes.push({ id: "root:update", label: "update", group: rule.update ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:update" })
      const dbUpdateGraph = convertRuleToGraph(rule.update, "update", "root:update")
      nodes.push(...dbUpdateGraph.nodes)
      edges.push(...dbUpdateGraph.edges)

      nodes.push({ id: "root:delete", label: "delete", group: rule.delete ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:delete" })
      const dbDeleteGraph = convertRuleToGraph(rule.delete, "delete", "root:delete")
      nodes.push(...dbDeleteGraph.nodes)
      edges.push(...dbDeleteGraph.edges)
      break

    case FILESTORE:
      nodes.push({ id: "root:create", label: "create", group: rule.create ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:create" })
      const fileCreateGraph = convertRuleToGraph(rule.create, "create", "root:create")
      nodes.push(...fileCreateGraph.nodes)
      edges.push(...fileCreateGraph.edges)

      nodes.push({ id: "root:read", label: "read", group: rule.read ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:read" })
      const fileReadGraph = convertRuleToGraph(rule.read, "read", "root:read")
      nodes.push(...fileReadGraph.nodes)
      edges.push(...fileReadGraph.edges)

      nodes.push({ id: "root:delete", label: "delete", group: rule.delete ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:delete" })
      const fileDeleteGraph = convertRuleToGraph(rule.delete, "delete", "root:delete")
      nodes.push(...fileDeleteGraph.nodes)
      edges.push(...fileDeleteGraph.edges)
      break

    default:
      const rootRuleGraph = convertRuleToGraph(rule, id, "root")
      nodes.push(...rootRuleGraph.nodes)
      edges.push(...rootRuleGraph.edges)
  }

  const graph = { nodes, edges };

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

    const selectedNodeIdStripped = selectedNodeId.replace("root:", "")
    switch (key) {
      case "del":
        if (selectedNodeId === "root") {
          notify("info", "Not supported", "Click on the `Use default rules` button instead to delete a complete rule", 10)
          return
        }
        if (selectedNodeId.startsWith("root:")) {
          setRule(dotProp.delete(rule, selectedNodeIdStripped));
          return
        }
        if (selectedNodeId.includes(".")) {
          setRule(dotProp.delete(rule, selectedNodeId));
          return
        }
        setRule(dotProp.set(rule, selectedNodeId, {}))
        break;


      case "ctrl+c":
        const copiedRule = Object.assign({}, dotProp.get(rule, selectedNodeIdStripped));
        if (copiedRule.clauses) copiedRule.clauses = [];
        if (copiedRule.clause) copiedRule.clause = {};
        setSelectedRule(copiedRule);
        break;

      case "ctrl+alt+c":
        setSelectedRule(dotProp.get(rule, selectedNodeIdStripped));
        break;

      case "ctrl+x":
        if (selectedNodeId === "root") {
          notify("info", "Not supported", "Cut on root block is not supported. Use copy instead", 10)
          return
        }
        setSelectedRule(dotProp.get(rule, selectedNodeIdStripped));
        if (selectedNodeId.startsWith("root:")) {
          setRule(dotProp.delete(rule, selectedNodeIdStripped));
          return
        }
        if (selectedNodeId.includes(".")) {
          setRule(dotProp.delete(rule, selectedNodeId));
          return
        }
        setRule(dotProp.set(rule, selectedNodeId, {}))
        break

      case "alt+r":
        setRule(dotProp.set(rule, selectedNodeId, selectedRule));
        break;

      case "ctrl+v":
        const ruleObj = dotProp.get(rule, selectedNodeId);
        if (selectedNodeId.startsWith("root:")) {
          setRule(dotProp.set(rule, selectedNodeIdStripped, selectedRule));
          return
        }
        if (selectedNodeId === "root") {
          notify("error", "Error", "Paste not allowed on root block")
          return
        }
        if (ruleObj.rule === "and" || ruleObj.rule === "or") {
          if (!ruleObj.clauses) ruleObj.clauses = []
          const newClauses = [...ruleObj.clauses, selectedRule]
          setRule(dotProp.set(rule, `${selectedNodeId}.clauses`, newClauses))
          return
        }
        if (ruleObj.rule === "query" || ruleObj.rule === "remove" || ruleObj.rule === "force") {
          const clauseId = `${selectedNodeId}.clause`;
          setRule(dotProp.set(rule, clauseId, selectedRule));
          return
        }
        notify("error", "Error", "Paste not allowed on this block. Do you want to replace this block instead?")
        break;
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