import React from "react";
import Graph from 'react-graph-vis';
import "./security-rules-graph.css";

const options = {
  groups: {
    no_rule: {
      color: {
        border: '#d0d0d0',
        background: '#eaeaea',
        highlight: {
          border: '#c0c0c0',
          background: '#eaeaea'
        }
      },
    },
    root: {
      borderWidth: 1,
      color: {
        border: "#53a415",
        background: "#b7eb8f",
        highlight: {
          border: "#6c944e",
          background: "#b7eb8f"
        }
      },
    },
    rule: {
      borderWidth: 1,
      color: {
        border: '#1e8bce',
        background: '#91d5ff',
        highlight: {
          border: "#036bab",
          background: '#91d5ff',
        }
      },
      shapeProperties: {
        borderDashes: false,
        borderRadius: 0,
      },
    },
    add_rule: {
      borderWidth: 2,
      color: {
        border: 'rgba(0, 0, 0, 0.37)',
        background: "#fff",
        highlight: {
          border: 'rgba(0, 0, 0, 0.45)',
          background: "#fff",
        }
      },
      shapeProperties: {
        borderDashes: [2, 4],
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
      background: 'white'
    },
    font: {
      size: 16,
    },
    margin: 16,
    widthConstraint: {
      maximum: 150
    }
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
    smooth: {
      enabled: true,
      type: "cubicBezier",
      forceDirection: "horizontal"
    }
  },
  layout: {
    hierarchical: {
      enabled: true,
      parentCentralization: false,
      sortMethod: 'directed',
      direction: 'LR',
      nodeSpacing: 120,
      levelSeparation: 200
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
