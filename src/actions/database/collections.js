import { scClient } from "../client";
import { checkResourcePermissions } from "../../utils";
import { configResourceTypes, permissionVerbs } from "../../constants";
import { set } from "automate-redux";

export const loadCollections = (projectId, dbAliasName) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    scClient.getJSON(`/v1/external/projects/${projectId}/database/${dbAliasName}/list-collections`)
    .then(({ status, data }) => {
      if (status < 200 || status >= 300) {
        reject(data.error)
        return
      }
      const result = data.result ? data.result : []
      dispatch(set(`dbCollections.${dbAliasName}`, result))
      resolve()
    })
    .catch(ex => reject(ex.toString()))
  })
}