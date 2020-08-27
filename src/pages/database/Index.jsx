import { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import databaseActions from "../../actions/database";

import './database.css'
import '../../index.css'

const { loadDbConfig, loadDbSchemas, loadDbRules, loadDbPreparedQueries } = databaseActions;

const Database = () => {
  const { projectID } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      dispatch(loadDbConfig(projectID))
        .catch(ex => notify("error", "Error fetching database config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(loadDbSchemas(projectID))
        .catch(ex => notify("error", "Error fetching database schemas", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(loadDbRules(projectID))
        .catch(ex => notify("error", "Error fetching database rules", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(loadDbPreparedQueries(projectID))
        .catch(ex => notify("error", "Error fetching prepared queries", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return null
}

export default Database;
