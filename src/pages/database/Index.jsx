import React, { useEffect } from 'react'
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';

import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import DatabaseEmptyState from '../../components/database-card/DatabaseEmptyState'
import ProjectPageLayout, { Content } from "../../components/project-page-layout/ProjectPageLayout"

import { loadDbSchemas, loadDbConfig, loadDbRules, getDbsConfig, loadDbPreparedQueries } from '../../operations/database';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

import './database.css'
import '../../index.css'

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
    }
  }, [projectID])

  if (activeDB) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${activeDB}/overview`} />;
  }

  if (dbAliasNames.length > 0) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${dbAliasNames[0]}`} />;
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="database" />
      <ProjectPageLayout>
        <Content>
          <DatabaseEmptyState />
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default Database;
