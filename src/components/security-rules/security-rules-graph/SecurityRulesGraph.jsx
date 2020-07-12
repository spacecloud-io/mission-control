import React from "react";
import Graph from 'react-graph-vis';
import "./security-rules-graph.css";

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
    margin: 16
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
  physics: false,
  height: "100%"
};

const SecurityRulesGraph = props => {
  return (
    <Graph
      graph={props.graph}
      options={options}
      events={props.events}
      getNetwork={(network) => {
        props.setNetwork(network);
      }}
    />
  )
}

export default SecurityRulesGraph
