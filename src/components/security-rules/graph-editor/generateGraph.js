import { securityRuleGroups } from "../../../constants"
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
      graph.nodes.push({ id: id, label: "+ Add rule", group: "add_rule" })
      graph.edges.push({ from: parentId, to: id })
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
  if (rule.rule === "query" || rule.rule === "force" || rule.rule === "remove" || rule.rule === "encrypt" || rule.rule === "decrypt" || rule.rule === "hash") {
    if (rule.clause && rule.clause.rule) {
      graph = mergeGraph(graph, convertRuleToGraph(rule.clause, `${id}.clause`, id))
    } else {
      graph.nodes.push({ id: `${id}.clause`, label: "Set clause", group: "add_rule" })
      graph.edges.push({ from: id, to: `${id}.clause` })
    }
  }
  return graph
}

const generateGraph = (ruleType, ruleName, rule) => {

  const nodes = []
  const edges = []

  nodes.push({ id: "root", label: ruleName, group: "root" })

  switch (ruleType) {
    case DB_COLLECTIONS:
      nodes.push({ id: "root:create", label: "create", group: rule.create ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:create" })
      const dbCreateGraph = convertRuleToGraph(rule.create, "rule:create", "root:create")
      nodes.push(...dbCreateGraph.nodes)
      edges.push(...dbCreateGraph.edges)

      nodes.push({ id: "root:read", label: "read", group: rule.read ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:read" })
      const dbReadGraph = convertRuleToGraph(rule.read, "rule:read", "root:read")
      nodes.push(...dbReadGraph.nodes)
      edges.push(...dbReadGraph.edges)

      nodes.push({ id: "root:update", label: "update", group: rule.update ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:update" })
      const dbUpdateGraph = convertRuleToGraph(rule.update, "rule:update", "root:update")
      nodes.push(...dbUpdateGraph.nodes)
      edges.push(...dbUpdateGraph.edges)

      nodes.push({ id: "root:delete", label: "delete", group: rule.delete ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:delete" })
      const dbDeleteGraph = convertRuleToGraph(rule.delete, "rule:delete", "root:delete")
      nodes.push(...dbDeleteGraph.nodes)
      edges.push(...dbDeleteGraph.edges)
      break

    case FILESTORE:
      nodes.push({ id: "root:create", label: "create", group: rule.create ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:create" })
      const fileCreateGraph = convertRuleToGraph(rule.create, "rule:create", "root:create")
      nodes.push(...fileCreateGraph.nodes)
      edges.push(...fileCreateGraph.edges)

      nodes.push({ id: "root:read", label: "read", group: rule.read ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:read" })
      const fileReadGraph = convertRuleToGraph(rule.read, "rule:read", "root:read")
      nodes.push(...fileReadGraph.nodes)
      edges.push(...fileReadGraph.edges)

      nodes.push({ id: "root:delete", label: "delete", group: rule.delete ? "root" : "no_rule" })
      edges.push({ from: "root", to: "root:delete" })
      const fileDeleteGraph = convertRuleToGraph(rule.delete, "rule:delete", "root:delete")
      nodes.push(...fileDeleteGraph.nodes)
      edges.push(...fileDeleteGraph.edges)
      break

    default:
      const rootRuleGraph = convertRuleToGraph(rule, "rule:root", "root")
      nodes.push(...rootRuleGraph.nodes)
      edges.push(...rootRuleGraph.edges)
  }

  return { nodes, edges };
}

export default generateGraph
