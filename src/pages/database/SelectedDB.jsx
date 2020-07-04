import { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { loadDbSchemas, loadDbRules, loadCollections, loadDBConnState, loadDbPreparedQueries, getDbConnState } from '../../operations/database';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

import './database.css'
import '../../index.css'

const SelectedDB = () => {
  const { projectID, selectedDB } = useParams()
  const dbConnected = useSelector(state => getDbConnState(state, selectedDB))

  useEffect(() => {
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
  }, [projectID])

  useEffect(() => {
    if (selectedDB) {
      incrementPendingRequests()
      loadDBConnState(projectID, selectedDB)
        .catch(ex => notify("error", "Error fetching database connection state", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID, selectedDB])

  useEffect(() => {
    if (selectedDB && dbConnected) {
      incrementPendingRequests()
      loadDBConnState(projectID, selectedDB)
        .catch(ex => notify("error", "Error fetching database connection state", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID, selectedDB, dbConnected])

  return null
}

export default SelectedDB;
