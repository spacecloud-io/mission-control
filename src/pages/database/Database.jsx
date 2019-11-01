import React from "react"
import { useParams, Redirect } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getProjectConfig, notify } from "../../utils"
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import mysql from '../../assets/mysql.svg'
import postgresql from '../../assets/postgresql.svg'
import mongodb from '../../assets/mongodb.svg'
import { Button } from "antd"
import { defaultDbConnectionStrings, defaultDBRules } from "../../constants"
import { setDBConfig, setColRule } from "./dbActions"

const Database = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  const dispatch = useDispatch()

  // Global state
  const projects = useSelector(state => state.projects)

  // Dervied properties
  const { enabled } = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}`, {})

  // Handlers
  const handleEnable = () => {
    const conn = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.conn`, defaultDbConnectionStrings[selectedDB])
    setDBConfig(projectID, selectedDB, true, conn).then(() => {
      notify("success", "Success", "Enabled database successfully")
      setColRule(projectID, selectedDB, "default", defaultDBRules)
        .catch(ex => notify("error", "Error configuring default rules", ex))
    }).catch(ex => notify("error", "Error enabling database", ex))
  }

  if (enabled) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${selectedDB}/overview`} />
  }

  let graphic = null
  let desc = ""
  let dbName = ""

  switch (selectedDB) {
    case "sql-mysql":
      desc = "The world's most popular open source database."
      dbName = "MySQL"
      graphic = mysql
      break
    case "sql-postgres":
      desc = "The world's most advanced open source database."
      dbName = "PostgreSQL"
      graphic = postgresql
      break
    case "mongo":
      desc = "A open-source cross-platform document- oriented database."
      dbName = "MongoDB"
      graphic = mongodb
      break
  }

  return (
    <div>
      <Topbar showProjectSelector showDbSelector />
      <Sidenav selectedItem="database" />
      <div className="page-content ">
        <div className="panel" style={{ margin: 24 }}>
          <img src={graphic} width={120} />
          <h2 style={{ marginTop: 24 }}>{dbName}</h2>
          <p className="panel__description" style={{ marginBottom: 0 }}>{desc}</p>
          <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={handleEnable}>Start using</Button>
        </div>
      </div>
    </div>
  )
}

export default Database