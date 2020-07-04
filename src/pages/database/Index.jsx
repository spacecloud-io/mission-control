import React, { useEffect } from 'react'
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';

import './database.css'
import '../../index.css'
import { loadDbSchemas, loadDbConfig, loadDbRules, getDbsConfig } from '../../operations/database';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

const Database = () => {
  const { projectID } = useParams()
  const dbConfig = useSelector(state => getDbsConfig(state))
  const dbAliasNames = Object.keys(dbConfig)
  const activeDB = dbAliasNames.find(dbAliasName => {
    return dbConfig[dbAliasName].enabled
  })

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  useEffect(() => {
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
