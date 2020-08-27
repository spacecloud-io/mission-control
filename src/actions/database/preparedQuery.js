import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { set } from "automate-redux";

export const loadPreparedQueries = (projectId) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const hasPermission = checkResourcePermissions(getState(), projectId, [configResourceTypes.DB_PREPARED_QUERIES], permissionVerbs.READ)
    if (!hasPermission) {
      console.warn("No permission to fetch db prepared queries")
      dispatch(set("dbPreparedQueries", {}))
      resolve()
      return
    }
    scClient.getJSON(`/v1/config/projects/${projectId}/database/prepared-queries`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const result = data.result ? data.result : []
      const dbPreparedQueries = result.reduce((prev, curr) => {
        const { id, db, ...preparedQueryConfig } = curr

        // Make sure that prepared query object has id in it
        const newPreparedQueryConfig = Object.assign({}, preparedQueryConfig, { id })

        const dbPreparedQuery = prev[db]
        if (dbPreparedQuery) {
          const newDbPreparedQuery = Object.assign({}, dbPreparedQuery)
          newDbPreparedQuery[id] = newPreparedQueryConfig
          return Object.assign({}, prev, { [db]: newDbPreparedQuery })
        }

        return Object.assign({}, prev, { [db]: { [id]: newPreparedQueryConfig } })
      }, {})
      dispatch(set("dbPreparedQueries", dbPreparedQueries))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}