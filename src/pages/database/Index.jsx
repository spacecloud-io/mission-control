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
        .catch(ex => notify("error", "Error fetching database config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbSchemas(projectID)
        .catch(ex => notify("error", "Error fetching database schemas", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbRules(projectID)
        .catch(ex => notify("error", "Error fetching database rules", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbPreparedQueries(projectID)
        .catch(ex => notify("error", "Error fetching prepared queries", ex))
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
