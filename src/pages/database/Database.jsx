import React, { useEffect } from 'react'
import { Redirect, useParams } from "react-router-dom";
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';

import Header from '../../components/header/Header'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import Documentation from '../../components/documentation/Documentation'
import DatabaseCardList from '../../components/database-card/DatabaseCardList'

import mysql from '../../assets/mysql.svg'
import postgresql from '../../assets/postgresql.svg'
import mongodb from '../../assets/mongodb.svg'
import './database.css'
import '../../index.css'

import { defaultDbConnectionStrings } from '../../constants';
import { getProjectConfig, notify } from "../../utils"
import { setDBConfig } from "./dbActions"
const Database = () => {
  const { projectID } = useParams()
  const projects = useSelector(state => state.projects)
  const crudModule = getProjectConfig(projects, projectID, "modules.crud", {})
  const activeDB = Object.keys(crudModule).find(db => {
    return crudModule[db].enabled
  })

  const handleDBEnable = (dbType) => {
    let conn = getProjectConfig(projects, projectID, `modules.crud.${dbType}.conn`, defaultDbConnectionStrings[dbType])
    setDBConfig(projectID, dbType, true, conn).catch(ex => notify("error", "Error", ex))
  }

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  const cards = [{ graphics: mysql, name: "MySQL", desc: "The world's most popular open source database.", key: "sql-mysql" },
  { graphics: postgresql, name: "PostgreSQL", desc: "The world's most advanced open source database.", key: "sql-postgres" },
  { graphics: mongodb, name: "MongoDB", desc: "A open-source cross-platform document- oriented database.", key: "mongo" }]

  if (activeDB) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${activeDB}/overview`} />;
  }
  return (
    <div className="database">
      <Topbar showProjectSelector />
      <div className="flex-box">
        <Sidenav selectedItem="database" />
        <div className="page-content">
          <div className="header-flex">
            <Header name="Add a database" color="#000" fontSize="22px" />
            <Documentation url="https://docs.spaceuptech.com" />
          </div>
          <p className="db-desc">Start using crud by enabling one of the following databases.</p>
          <DatabaseCardList cards={cards} handleEnable={handleDBEnable} />
        </div>
      </div>
    </div>
  )
}

export default Database;
