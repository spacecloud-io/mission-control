import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import Client from "./client"

class Eventing {
  constructor(client) {
    this.client = client
  }

  fetchEventLogs(projectId, { status, showName, name, showDate, startDate, endDate }, lastEventDate, dbType) {
    return new Promise((resolve, reject) => {
      let uri = `/v1/api/${projectId}/graphql`
      if (process.env.REACT_APP_DISABLE_MOCK) {
        uri = "http://localhost:4122" + uri
      }
      const cache = new InMemoryCache({ addTypename: false });
      const link = new HttpLink({ uri: uri });
      const graphqlClient = new ApolloClient({
        cache: cache,
        link: link
      });

      graphqlClient.query({
        query: gql`
        query {
          event_logs (
            sort: ["-event_ts"],
            limit: 100,
            where: {
              status: {_in: $status}
              ${showName ? "rule_name: {_in: $name, _regex: $regexForInternalEventLogs}" : "rule_name: {_regex: $regexForInternalEventLogs}"}
              ${showDate ? "event_ts: {_gte: $startDate, _lte: $endDate}" : ""}
              event_ts: {_lte: $lastEventDate}
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
        variables: { status, name, startDate, endDate, lastEventDate, regexForInternalEventLogs: `^(?!realtime-${dbType}-.*$).*` }
      }).then(res => resolve(res.data.event_logs)).catch(ex => reject(ex.toString()))
    })
  }

  setEventingConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/config/eventing-config`, config)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  queueEvent(projectId, event, token) {
    const client = new Client()
    if (token) client.setToken(token)
    return new Promise((resolve, reject) => {
      client.postJSON(`/v1/api/${projectId}/eventing/queue`, event)
        .then(({ status, data }) => {
          if (status !== 200) {
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
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/triggers/${triggerName}`, { id: triggerName, ...triggerRule })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteTriggerRule(projectId, triggerName) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/triggers/${triggerName}`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteSecurityRule(projectId, type) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/rules/${type}`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setSecurityRule(projectId, type, rule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/rules/${type}`, { ...rule, id: type })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setEventSchema(projectId, type, schema) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/schema/${type}`, { id: type, schema: schema })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  deleteEventSchema(projectId, type) {
    return new Promise((resolve, reject) => {
      this.client.delete(`/v1/config/projects/${projectId}/eventing/schema/${type}`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }
}

export default Eventing