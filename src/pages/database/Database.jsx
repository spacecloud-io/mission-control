import React, { useState, useEffect } from "react"
import { useParams, Redirect, } from "react-router-dom"
import { useSelector } from "react-redux"
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../utils"
import Topbar from "../../components/topbar/Topbar"
import Sidenav from "../../components/sidenav/Sidenav"
import mysql from '../../assets/mysql.svg'
import postgresql from '../../assets/postgresql.svg'
import mongodb from '../../assets/mongodb.svg'
import sqlserver from "../../assets/sqlserverIcon.svg"
import { Button } from "antd"
import EnableDBForm from "../../components/database/enable-db-form/EnableDBForm"
import { defaultDbConnectionStrings, dbTypes, projectModules, actionQueuedMessage } from "../../constants"
import { enableDb, getDbConfig } from "../../operations/database"
import { getSecrets } from '../../operations/secrets';

const Database = () => {

  // Router params
  const { projectID, selectedDB } = useParams()

  // Component state
  const [modalVisible, setModalVisible] = useState(false)

  // Global state
  const { enabled, type, conn } = useSelector(state => getDbConfig(state, selectedDB))
  const dbType = type ? type : selectedDB
  const totalSecrets = useSelector(state => getSecrets(state))

  const envSecrets = totalSecrets
    .filter(obj => obj.type === "env")
    .map(obj => obj.id);

  // Handlers
  const handleEnable = (conn) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      enableDb(projectID, selectedDB, conn)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Successfully enabled database")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error enabling database", ex)
          reject()
        })
        .finally(() => decrementPendingRequests())
    })
  }

  if (enabled) {
    return <Redirect to={`/mission-control/projects/${projectID}/database/${selectedDB}/overview`} />
  }

  let graphic = null
  let desc = ""
  let dbName = ""

  switch (dbType) {
    case dbTypes.MYSQL:
      desc = "The world's most popular open source database."
      dbName = "MySQL"
      graphic = mysql
      break
    case dbTypes.POSTGRESQL:
      desc = "The world's most advanced open source database."
      dbName = "PostgreSQL"
      graphic = postgresql
      break
    case dbTypes.MONGO:
      desc = "A open-source cross-platform document- oriented database."
      dbName = "MongoDB"
      graphic = mongodb
      break
    case dbTypes.SQLSERVER:
      desc = "SQL Server is a relational database management system, developed and marketed by Microsoft."
      dbName = "SQL Server"
      graphic = sqlserver
  }

  const defaultConnString = conn ? conn : defaultDbConnectionStrings[dbType]

  return (
    <div>
      <Topbar showProjectSelector showDbSelector />
      <Sidenav selectedItem={projectModules.DATABASE} />
      <div className="page-content ">
        <div className="panel" style={{ margin: 24 }}>
          <img src={graphic} style={{ width: 120 }} />
          <h2 style={{ marginTop: 24 }}>{dbName}</h2>
          <p className="panel__description" style={{ marginBottom: 0 }}>{desc}</p>
          <Button style={{ marginTop: 16 }} type="primary" className="action-rounded" onClick={() => setModalVisible(true)}>Start using</Button>
        </div>
      </div>
      {modalVisible && <EnableDBForm
        initialValues={{ conn: defaultConnString, db: dbType }}
        envSecrets={envSecrets} 
        handleSubmit={handleEnable}
        handleCancel={() => setModalVisible(false)} />}
    </div>
  )
}

export default Database