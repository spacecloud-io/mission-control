import { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import database from "../../actions/database";

import './database.css'
import '../../index.css'

const Database = () => {
  const { projectID } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      dispatch(database.loadConfig(projectID))
        .catch(ex => notify("error", "Error fetching database config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(database.loadSchemas(projectID))
        .catch(ex => notify("error", "Error fetching database schemas", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(database.loadRules(projectID))
        .catch(ex => notify("error", "Error fetching database rules", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(database.loadPreparedQueries(projectID))
        .catch(ex => notify("error", "Error fetching prepared queries", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return null
}

export default Database;
