import React, { useEffect } from "react";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import DatabaseEmptyState from '../../../components/database-card/DatabaseEmptyState'
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { getDbsConfig } from "../../../operations/database";

function EmptyState() {

  const { projectID } = useParams()

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  const dbConfig = useSelector(state => getDbsConfig(state))
  const dbAliasNames = Object.keys(dbConfig)
  const activeDB = dbAliasNames.find(dbAliasName => {
    return dbConfig[dbAliasName].enabled
  })

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

export default EmptyState;