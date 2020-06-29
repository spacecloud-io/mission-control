import React, { useState } from 'react';
import Graph from 'react-graph-vis';
import { Alert, Dropdown, Menu } from 'antd';
import ConfigureRule from './ConfigureRule';
import dotProp from 'dot-prop-immutable';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { notify } from '../../utils';

/* import "./styles.css";
// need to import the vis network css in order to show tooltip
import "./network.css"; */

const testRule = {
  create: {
    rule: 'remove',
    fields: ['res.password'],
    clause: {
      rule: 'match',
      eval: '!=',
      type: 'bool',
      f1: 'args.auth.role',
      f2: 'admin',
    },
  },
  read: {
    rule: 'or',
    clauses: [
      {
        rule: 'or',
        clauses: [
          {
            rule: 'query',
            db: 'mongo',
            col: 'profiles',
            find: {
              userId: 'args.find.userId',
              isPublic: true,
            },
            clause: {
              rule: 'and',
              clauses: [{}],
            },
          },
          {
            rule: 'match',
            type: 'string',
            eval: '==',
            f1: 'utils.length(args.result)',
            f2: 'hola',
          },
        ],
      },
      {
        rule: 'match',
        eval: '==',
        type: 'string',
        f1: 'args.auth.id',
        f2: 'args.find.userId',
      },
    ],
  },
  update: {},
  delete: {
    rule: 'deny',
  },
};

const Builder = () => {

  const [drawer, setDrawer] = useState(false);
  const [rule, setRule] = useState(testRule);
  const [selectedRule, setSelectedRule] = useState({});
  const [selectedNodeId, setselectedNodeId] = useState();
  const [network, setNetwork] = useState();

  const nodes = [{ id: 'default', label: 'default', group: 'crud' }];
  const edges = [];

  const bc = new BroadcastChannel("builder");

  // And, or rule
  const nestedNodes = (clauses, parentId) => {
    for (let i = 0; i < 2; i++) {
      const childId = `${parentId}.clauses.${i}`;

      if (clauses[i] && Object.keys(clauses[i]).length > 0) {
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
        if (clauses[i].rule === 'query' || clauses[i].rule === 'remove') {
          clauseNodes(clauses[i].clause, childId);
        }
      } else {
        nodes.push({ id: childId, label: '+ Add rule', group: 'add_rule' });
        edges.push({ from: parentId, to: childId });
      }
    }
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
  Object.entries(rule).map(([key, value]) => {
    if (Object.keys(value).length === 0) {
      nodes.push({ id: `${key}Rule`, label: key, group: 'no_rule_crud' });
      nodes.push({ id: key, label: '+ Add rule', group: 'add_rule' });
    } else {
      nodes.push({ id: `${key}Rule`, label: key, group: 'crud' });
      nodes.push({ id: key, label: value.rule, ...value, group: 'rule' });
    }
    edges.push({ from: 'default', to: `${key}Rule` });
    edges.push({ from: `${key}Rule`, to: key });

    if (value.rule === 'query' || value.rule === 'remove') {
      clauseNodes(value.clause, key);
    }

    if (value.rule === 'or' || value.rule === 'and') {
      nestedNodes(value.clauses, key);
    }
  });

  // On drawer form submit
  const onSubmit = (values, id) => {
    setRule(dotProp.set(rule, id, values));
  };

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
      console.log(nodeId);
      bc.postMessage('This is a test message.');
    },
    select: (event) => {
      const node = event.nodes[0];
      if (node && !node.includes('Rule')) setselectedNodeId(node);
    },
    doubleClick: function (event) {
      const ruleObj = nodes.find((val) => val.id === event.nodes[0]);
      setSelectedRule(ruleObj);
      setDrawer(true);
    },
  };

  // shortcut events handler
  const shortcutsHandler = (key) => {
    console.log('key: ' + key);
    if (!selectedNodeId) return;

    if (key === 'del') {
      setRule(dotProp.set(rule, selectedNodeId, {}));
    }
     
    else if (key === 'ctrl+c') {
      const copiedRule = Object.assign({}, dotProp.get(rule, selectedNodeId));
      if (copiedRule.clauses) copiedRule.clauses = [];
      else if (copiedRule.clause) copiedRule.clause = {};
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
      if (ruleObj.rule === 'and' || ruleObj.rule === 'or') {
        for (let i = 0; i < 2; i++) {
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

  const menu = (
    <Menu onClick={({ key }) => shortcutsHandler(key)}>
      <Menu.Item key='ctrl+c'>Copy</Menu.Item>
      <Menu.Item key='ctrl+alt+c'>Copy with children</Menu.Item>
      <Menu.Item key='ctrl+x'>Cut</Menu.Item>
      <Menu.Item key='ctrl+v'>Paste behind and/or</Menu.Item>
      <Menu.Item key='alt+r'>Replace</Menu.Item>
      <Menu.Item key='del'>Delete</Menu.Item>
    </Menu>
  );

  return (
    <>
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
    </>
  );
};

export default Builder;
