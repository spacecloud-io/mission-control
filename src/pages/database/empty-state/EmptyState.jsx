import React, { useEffect } from "react";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import DatabaseEmptyState from '../../../components/database-card/DatabaseEmptyState'
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { getDbConfigs } from "../../../operations/database";
import { projectModules } from "../../../constants";
import { getLastUsedValues, setLastUsedValues } from "../../../utils";

function EmptyState() {

  const { projectID } = useParams()

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  const dbConfig = useSelector(state => getDbConfigs(state))
  const dbAliasNames = Object.keys(dbConfig)
  const lastUsedDb = getLastUsedValues(projectID).db;
  
  if (dbAliasNames.length > 0 && lastUsedDb) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${lastUsedDb}/overview`} />; // MARK
  }

  if (dbAliasNames.length > 0) {
    setLastUsedValues(projectID, { db: dbAliasNames[0]})
    return <Redirect to={`/mission-control/projects/${projectID}/database/${dbAliasNames[0]}`} />;
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DATABASE} />
      <ProjectPageLayout>
        <Content>
          <DatabaseEmptyState />
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default EmptyState;