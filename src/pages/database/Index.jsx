import { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { loadDbSchemas, loadDbConfig, loadDbRules, loadDbPreparedQueries } from '../../operations/database';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { loadSecrets } from '../../operations/secrets';

import './database.css'
import '../../index.css'

const Database = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadDbConfig(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get db-config" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbSchemas(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get db-schema" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbRules(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get db-rule" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbPreparedQueries(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to set db-prepared-query" : error.msg))
        .finally(() => decrementPendingRequests())
      
      incrementPendingRequests()
      loadSecrets(projectID)
        .catch(ex => notify("error", "Error fetching secrets", ex))
        .finally(() => decrementPendingRequests())
      
    }
  }, [projectID])

  return null
}

export default Database;
