import React, { useEffect } from 'react'
import { Redirect, useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import ReactGA from 'react-ga';

import './database.css'
import '../../index.css'
import { loadDbSchemas, loadDbConfig, loadDbRules } from '../../operations/database';
import { increment, decrement } from 'automate-redux';
import { notify } from '../../utils';

const Database = () => {
  const { projectID } = useParams()
  const dispatch = useDispatch()
  const dbConfig = useSelector(state => state.dbConfig)
  const dbAliasNames = Object.keys(dbConfig)
  const activeDB = dbAliasNames.find(dbAliasName => {
    return dbConfig[dbAliasName].enabled
  })

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  useEffect(() => {
    dispatch(increment("pendingRequests"))
    loadDbConfig(projectID)
      .catch(ex => notify("error", "Error fetching database config", ex))
      .finally(() => dispatch(decrement("pendingRequests")))

    dispatch(increment("pendingRequests"))
    loadDbSchemas(projectID)
      .catch(ex => notify("error", "Error fetching database schemas", ex))
      .finally(() => dispatch(decrement("pendingRequests")))

    dispatch(increment("pendingRequests"))
    loadDbRules(projectID)
      .catch(ex => notify("error", "Error fetching database rules", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }, [projectID])

  if (activeDB) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${activeDB}/overview`} />;
  }

  if (dbAliasNames.length > 0) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${dbAliasNames[0]}`} />;
  }

  return (
    null
  )
}

export default Database;
