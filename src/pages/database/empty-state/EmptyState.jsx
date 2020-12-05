import React from "react";
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import DatabaseEmptyState from '../../../components/database-card/DatabaseEmptyState'
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { getDbConfigs } from "../../../operations/database";
import { projectModules } from "../../../constants";
import { getLastUsedValues, setLastUsedValues } from "../../../utils";

function EmptyState() {

  const { projectID } = useParams()

  const dbConfig = useSelector(state => getDbConfigs(state))
  const dbAliasNames = Object.keys(dbConfig)

  const activeDB = dbAliasNames.find(dbAliasName => dbConfig[dbAliasName].enabled)
  const lastUsedDb = getLastUsedValues(projectID).db;

  // If last used db is still present in the config, then open that first
  if (dbAliasNames.findIndex(db => db === lastUsedDb) !== -1) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${lastUsedDb}/overview`} />
  }

  if (activeDB) {	
    return <Redirect to={`/mission-control/projects/${projectID}/database/${activeDB}/overview`} />;	
  }

  if (dbAliasNames.length > 0) {
    setLastUsedValues(projectID, { db: dbAliasNames[0] })
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