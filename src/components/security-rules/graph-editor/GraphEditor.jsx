import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Alert, message } from "antd"
import dotProp from 'dot-prop-immutable';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import ConfigureRule from '../configure-rule/ConfigureRule';
import SecurityRulesGraph from "../security-rules-graph/SecurityRulesGraph";
import { saveObjectToLocalStorage, getObjectFromLocalStorage } from "../../../utils";
import generateGraph from "./generateGraph";

const LOCAL_STORAGE_RULE_KEY = "securityRuleBuilder:copiedRule"

const getStrippedKey = (ruleKey) => ruleKey.replace("rule:", "").replace("root:", "").replace("root.", "")

const getDoubleClickedRuleObject = (rule, ruleKey) => {
  if (ruleKey === "rule:root") {
    return rule
  }

  return dotProp.get(rule, getStrippedKey(ruleKey), {})
}

function GraphEditor({ rule, setRule, ruleName, ruleMetaData, isCachingEnabled }) {
  const { ruleType } = ruleMetaData

  // Component state
  const [selectedNodeId, setselectedNodeId] = useState();
  const [doubleClickedNodeId, setDoubleClickedNodeId] = useState("");
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

  // Derived state
  const graph = generateGraph(ruleType, ruleName, rule)
  const doubleClickedRuleObj = doubleClickedNodeId ? getDoubleClickedRuleObject(rule, doubleClickedNodeId) : {} // Used in the configure rule form as initial values

  // mouse events handlers
  const events = {
    oncontext: (event) => {
      const position = event.pointer.DOM;
      const nodeId = network.getNodeAt(position);
      if (nodeId) {
        network.selectNodes([nodeId], false);
        const group = graph.nodes.find(val => val.id === nodeId).group;
        if (group !== "add_rule") {
          setselectedNodeId(nodeId);
        }
      }
    },
    select: (event) => {
      const node = event.nodes[0];
      if (!node) return;
      const group = graph.nodes.find(val => val.id === node).group;
      // Set double clicked node id since clicking the add rule button should open the configure rule form 
      // same as how double clicking a node opens the configure rule form.
      if (group === "add_rule") {
        setDoubleClickedNodeId(node)
      } else {
        setselectedNodeId(node);
      }
    },
    doubleClick: function (event) {
      const nodeId = event.nodes[0];
      if (nodeId && nodeId.startsWith("root")) {
        message.error("Operation not allowed. Only rule blocks (blue ones) can be double clicked to configure them")
        return
      }
      setDoubleClickedNodeId(nodeId);
    },
  };

  // shortcut events handler
  const shortcutsHandler = (key) => {
    if (!selectedNodeId) return;
    if (selectedNodeId === "root") {
      message.error("No operations are allowed on root block")
      return
    }

    const strippedKey = getStrippedKey(selectedNodeId)
    const selectedRuleObj = Object.assign({}, strippedKey === "root" ? rule : dotProp.get(rule, strippedKey))

    switch (key) {
      case "ctrl+c":
        if (selectedNodeId.includes("root:")) {
          message.error("Copy is not allowed on this block. Copy a rule block instead")
          return
        }

        delete selectedRuleObj["clause"]
        delete selectedRuleObj["clauses"]
        saveObjectToLocalStorage(LOCAL_STORAGE_RULE_KEY, selectedRuleObj)
        break;

      case "ctrl+alt+c":
        if (selectedNodeId.includes("root:")) {
          message.error("Copy is not allowed on this block. Copy a rule block instead")
          return
        }

        saveObjectToLocalStorage(LOCAL_STORAGE_RULE_KEY, selectedRuleObj)
        break;

      case "ctrl+x":
        if (strippedKey === "root" || selectedNodeId.includes("root:")) {
          message.error("Cut is not allowed on this block. Only child rule blocks can be cut")
          return
        }

        saveObjectToLocalStorage(LOCAL_STORAGE_RULE_KEY, selectedRuleObj)
        setRule(dotProp.delete(rule, strippedKey))
        break

      case "alt+r":
        if (selectedNodeId.includes("root:")) {
          message.error("Replace operation not allowed on this block. Try replacing a rule block (blue ones)")
          return
        }

        getObjectFromLocalStorage(LOCAL_STORAGE_RULE_KEY)
          .then(copiedRule => {
            if (strippedKey === "root") {
              setRule(copiedRule);
              return
            }
            setRule(dotProp.set(rule, strippedKey, copiedRule))
          })
          .catch(ex => message.error(ex.toString()))
        break;

      case "ctrl+v":
        getObjectFromLocalStorage(LOCAL_STORAGE_RULE_KEY)
          .then(copiedRule => {
            if (selectedNodeId.includes("root:")) {
              setRule(dotProp.set(rule, strippedKey, copiedRule))
              return
            }
            if (selectedRuleObj.rule === "and" || selectedRuleObj.rule === "or") {
              const noOfClauses = selectedRuleObj.clauses ? selectedRuleObj.clauses.length : 0
              if (strippedKey === "root") {
                setRule(dotProp.set(rule, `clauses.${noOfClauses}`, copiedRule))
              } else {
                setRule(dotProp.set(rule, `${strippedKey}.clauses.${noOfClauses}`, copiedRule))
              }
              return
            }
            if (selectedRuleObj.rule === "query" || selectedRuleObj.rule === "force" || selectedRuleObj.rule === "remove" || selectedRuleObj.rule === "encrypt" || selectedRuleObj.rule === "decrypt" || selectedRuleObj.rule === "hash") {
              if (strippedKey === "root") {
                setRule(dotProp.set(rule, "clause", copiedRule))
              } else {
                setRule(dotProp.set(rule, `${strippedKey}.clause`, copiedRule))
              }
              return
            }
            message.error("Paste operation is not valid on this block.")
          })
          .catch(ex => message.error(ex.toString()))
        break

      case "del":
        if (strippedKey === "root") {
          message.error("Deleting the root rule is not supported")
          return
        }

        setRule(dotProp.delete(rule, strippedKey))
        break;
    }
  };

  // On drawer form submit
  const onSubmit = (values) => {
    if (doubleClickedNodeId === "rule:root") {
      setRule(values)
      return
    }
    setRule(dotProp.set(rule, getStrippedKey(doubleClickedNodeId), values));
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
      {doubleClickedNodeId && (
        <ConfigureRule
          selectedRule={doubleClickedRuleObj}
          closeDrawer={() => setDoubleClickedNodeId("")}
          ruleMetaData={ruleMetaData}
          onSubmit={onSubmit}
          selectedNodeId={getStrippedKey(doubleClickedNodeId).split(".")[0]}
          blockDepth={doubleClickedNodeId.split(".").length}
          isCachingEnabled={isCachingEnabled}
        />
      )}
    </React.Fragment>
  )
}

export default GraphEditor;