import React, { useState } from "react"
import { useParams, Redirect,  } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getProjectConfig, notify } from "../../utils"
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import mysql from '../../assets/mysql.svg'
import postgresql from '../../assets/postgresql.svg'
import mongodb from '../../assets/mongodb.svg'
import { Button } from "antd"
import EnableDBForm from "../../components/database/enable-db-form/EnableDBForm"
import { defaultDbConnectionStrings, defaultDBRules } from "../../constants"
import { dbEnable } from "./dbActions"
import { increment, decrement } from "automate-redux"

const Database = () => {

  const dispatch = useDispatch()

  // Router params
  const { projectID, selectedDB } = useParams()

  // Global state
  const projects = useSelector(state => state.projects)

  // Component state
  const [modalVisible, setModalVisible] = useState(false)

  // Dervied properties
  const { enabled, type, conn } = getProjectConfig(projects, projectID, `modules.db.${selectedDB}`, {})
  const dbType = type ? type : selectedDB

  // Handlers
  const handleEnable = (conn, defaultCollectionRule) => {
    const dbName = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.name`)
    dispatch(increment("pendingRequests"))
    dbEnable(projects, projectID, selectedDB, dbType, dbName, conn, defaultCollectionRule)
    .then(() => notify("success", "Success", "Successfully enabled database"))
    .catch(ex => notify("error", "Error enabling database", ex))
    .finally(() => dispatch(decrement("pendingRequests")))
  }

  if (enabled) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${selectedDB}/overview`} />
  }

  let graphic = null
  let desc = ""
  let dbName = ""

  switch (dbType) {
    case "mysql":
      desc = "The world's most popular open source database."
      dbName = "MySQL"
      graphic = mysql
      break
    case "postgres":
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

  const defaultConnString = conn ? conn : defaultDbConnectionStrings[dbType]

  return (
    <div>
      <Topbar showProjectSelector showDbSelector />
      <Sidenav selectedItem="database" />
      <div className="page-content ">
        <div className="panel" style={{ margin: 24 }}>
          <img src={graphic} style={{ width: 120 }} />
          <h2 style={{ marginTop: 24 }}>{dbName}</h2>
          <p className="panel__description" style={{ marginBottom: 0 }}>{desc}</p>
          <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setModalVisible(true)}>Start using</Button>
        </div>
      </div>
      {modalVisible && <EnableDBForm
        initialValues={{ conn: defaultConnString, rules: defaultDBRules }}
        handleSubmit={handleEnable}
        handleCancel={() => setModalVisible(false)} />}
    </div>
  )
}

export default Database