import gql from 'graphql-tag';
import { createRESTClient, createGraphQLClient } from "./client";
import { spaceCloudClusterOrigin } from "../constants"

class Eventing {
  constructor(client) {
    this.client = client
  }

  fetchEventingConfig(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/eventing/config`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          const eventingConfig = data.result && data.result[0] ? data.result[0] : {}
          resolve(eventingConfig)
        })
        .catch(ex => reject({title: "Failed to get eventing-config", msg: ex.message}))
    })
  }

  fetchEventingSchemas(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/eventing/schema`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get eventing-schema", msg: ex.message}))
    })
  }

  fetchEventingRules(projectId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/eventing/rules`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get eventing-rule", msg: ex.message}))
    })
  }

  fetchEventingTriggers(projectId, triggerId) {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/config/projects/${projectId}/eventing/triggers?id=${triggerId}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve(data.result ? data.result : [])
        })
        .catch(ex => reject({title: "Failed to get eventing-trigger", msg: ex.message}))
    })
  }

  fetchEventLogs(projectId, { status, showName, name, showDate, startDate, endDate }, lastEventDate, dbType, getToken) {
    let uri = `/v1/api/${projectId}/graphql`
    if (spaceCloudClusterOrigin) {
      uri = spaceCloudClusterOrigin + uri;
    }
    const graphqlClient = createGraphQLClient(uri, getToken)
    return new Promise((resolve, reject) => {
      graphqlClient.query({
        query: gql`
        query {
          event_logs (
            sort: ["-event_ts"],
            limit: 100,
            where: {
              status: {_in: $status}
              ${showName ? "rule_name: {_in: $name" : ""}
              ${showDate ? "event_ts: {_gte: $startDate, _lte: $endDate}" : ""}
              event_ts: {_lte: $lastEventDate}
              trigger_type: {_ne: "internal"}
            }
          ) @${dbType} {
            _id
            rule_name
            status
            event_ts
            invocation_logs (
              where: {event_id: {_eq: "event_logs._id"}}
            ) @${dbType} {
              _id
              invocation_time
              response_status_code
              request_payload
              response_body
              error_msg
            }
          }
        }
      `,
        variables: { status, name, startDate, endDate, lastEventDate }
      }).then(res => {
        const { data, errors } = res
        if (errors && errors.length > 0) {
          reject(errors[0].message)
          return
        }

        resolve(data.event_logs)
      }).catch(ex => reject(ex.toString()))
    })
  }

  setEventingConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/config/eventing-config`, config)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set eventing-config", msg: ex.message}))
    })
  }

  queueEvent(projectId, event, token) {
    const client = createRESTClient(spaceCloudClusterOrigin)
    return new Promise((resolve, reject) => {
      client.postJSON(`/v1/api/${projectId}/eventing/queue`, event, token)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject(data.error)
            return
          }
          resolve(data)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setTriggerRule(projectId, triggerName, triggerRule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/triggers/${triggerName}`, triggerRule)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set eventing-trigger", msg: ex.message}))
    })
  }

  deleteTriggerRule(projectId, triggerName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/triggers/${triggerName}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete eventing-trigger", msg: ex.message}))
    })
  }

  deleteSecurityRule(projectId, type) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/rules/${type}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete eventing-rule", msg: ex.message}))
    })
  }

  setSecurityRule(projectId, type, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/rules/${type}`, { ...rule, id: type })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set eventing-rule", msg: ex.message}))
    })
  }

  setEventSchema(projectId, type, schema) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/schema/${type}`, { id: type, schema: schema })
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to set eventing-schema", msg: ex.message}))
    })
  }

  deleteEventSchema(projectId, type) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/schema/${type}`)
        .then(({ status, data }) => {
          if (status < 200 || status >= 300) {
            reject({title: data.error, msg: data.rawError})
            return
          }
          resolve({ queued: status === 202 })
        })
        .catch(ex => reject({title: "Failed to delete eventing-schema", msg: ex.message}))
    })
  }

  deleteEventLogs(projectId, dbAlias, timestamp, getToken) {
    let uri = `/v1/api/${projectId}/graphql`
    if (spaceCloudClusterOrigin) {
      uri = spaceCloudClusterOrigin + uri;
    }
    const graphqlClient = createGraphQLClient(uri, getToken)
    return new Promise((resolve, reject) => {
      graphqlClient.mutate({
        mutation: gql`
        mutation {
          delete_invocation_logs(
            where: {
              invocation_time: {
                _lte: $timestamp
              }
            }
          ) @${dbAlias}
        
          delete_event_logs(
            where: {
              event_ts: {
                _lte: $timestamp
              }
            }
          ) @${dbAlias}
        }
        `,
        variables: { timestamp }
      }).then(res => {
        const { data, errors } = res
        if (errors && errors.length > 0) {
          reject(errors[0].message)
          return
        }

        resolve()
      }).catch(ex => reject(ex.toString()))
    })
  }
}

export default Eventing