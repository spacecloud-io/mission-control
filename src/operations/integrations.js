export function deleteIntegration(integrationId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 1000)
  })
}

export function getIntegrations(state) {
  return [
    {
      id: "team-management",
      name: "Team Management",
      desc: "Enterprise grade team management module for granular login permissions and much more",
      installed: true
    },
    {
      id: "elastic-search",
      name: "Elastic Search",
      desc: "Add search capabilities for your app powered by Elastic Search",
      installed: false
    }
  ]
}

export function getIntegrationDetails(state, integrationId) {
  return {
    id: "team-management",
    name: "Team Management",
    desc: "Enterprise grade team management module for granular login permissions and much more",
    details: `### Description
Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more
### Install 
Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more
### Note 
Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more Enterprise grade team management module for granular login permissions and much more
### Requirement
-  Deployment(0.1 cpu, 200 MB RAM)`,
    installed: false
  }
}

export function getIntegrationConfigPermissions(state, integrationId) {
  return [
    {
      resource: "db-config",
      read: true,
      modify: true,
      webhook: true,
      override: false
    },
    {
      resource: "db-schema",
      read: true,
      modify: true,
      webhook: true,
      override: false
    },
    {
      resource: "db-rule",
      read: true,
      modify: true,
      webhook: true,
      override: false
    },
    {
      resource: "db-prepared-query",
      read: true,
      modify: true,
      webhook: true,
      override: false
    },
    {
      resource: "eventing-trigger",
      read: true,
      modify: true,
      webhook: true,
      override: true
    },
    {
      resource: "eventing-config",
      read: true,
      modify: true,
      webhook: true,
      override: true
    },
  ]
}

export function getIntegrationAPIPermissions(state, integrationId) {
  return []
}