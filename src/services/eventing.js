import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import store from '../store';

class Eventing {
  constructor(client) {
    this.client = client
  }

  fetchEventLogs(projectId, {status, showName, name, showDate, startDate, endDate}, lastEventID, dbType){
    return new Promise((resolve, reject) => {
      let uri = `/v1/api/${projectId}/graphql`
      if (process.env.NODE_ENV !== "production") {
        uri = "http://localhost:4122" + uri;
      }
    const cache = new InMemoryCache({ addTypename: false });
    const link = new HttpLink({ uri: uri });
    const graphlqlClient = new ApolloClient({
      cache: cache,
      link: link
    });

    graphlqlClient.query({
      query: gql`
        query {
          event_logs (
            limit: 10,
            where: {
              status: {_in: $status},
              ${showName ? "rule_name: {_in: $name}" : ""}
              ${showDate ? "event_timestamp: {_gte: $startDate, _lte: $endDate}" : ""}
              ${lastEventID ? "_id: {_gt: $lastEventID}": ""}
            }
          ) @${dbType} {
            _id
            rule_name
            status
            event_timestamp
            invocation_logs (
              where: {event_id: {_eq: "event_logs._id"}}
            ) @${dbType} {
              _id
              response_status_code
              invocation_time
              request_payload
              response_body
            }
          }
        }
      `,
      variables: {status, name, startDate, endDate, lastEventID}
    }).then(res => resolve(res.data.event_logs)).catch(ex => reject(ex.toString()))
    })
  }

  setEventingConfig(projectId, config) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/config`, config)
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

  queueEvent(projectId, event) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/api/${projectId}/eventing/queue`, event)
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

  setTriggerRule(projectId, triggerName, triggerRule) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/triggers/${triggerName}`, triggerRule)
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
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/rules/${type}`, { rule: rule })
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
      this.client.postJSON(`/v1/config/projects/${projectId}/eventing/schema/${type}`, { schema: schema })
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