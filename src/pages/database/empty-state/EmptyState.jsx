import React, { useEffect } from 'react'
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';

import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import DatabaseEmptyState from '../../../components/database-card/DatabaseEmptyState'
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"

const Database = () => {
  const { projectID } = useParams()
  const dbConfig = useSelector(state => state.dbConfig)
  const dbAliasNames = Object.keys(dbConfig)
  const activeDB = dbAliasNames.find(dbAliasName => {
    return dbConfig[dbAliasName].enabled
  })

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  if (activeDB) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${activeDB}/overview`} />;
  }
  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="database" />
      <ProjectPageLayout>
        <Content>
          <DatabaseEmptyState />
        </Content>
      </ProjectPageLayout>
    </div>
  )
}

export default Database;
