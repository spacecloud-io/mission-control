import React, { useEffect } from 'react'
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';

import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import DatabaseEmptyState from '../../components/database-card/DatabaseEmptyState'

import './database.css'
import '../../index.css'

import { getProjectConfig, notify } from "../../utils"

const Database = () => {
  const { projectID } = useParams()
  const projects = useSelector(state => state.projects)
  const dbModule = getProjectConfig(projects, projectID, "modules.db", {})
  const activeDB = Object.keys(dbModule).find(db => {
    return dbModule[db].enabled
  })

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  if (activeDB) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${activeDB}/overview`} />;
  }
  return (
    <div className="database">
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem="database" />
        <div className="page-content">
          <div style={{ marginTop: 24 }}>
            <DatabaseEmptyState />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Database;
