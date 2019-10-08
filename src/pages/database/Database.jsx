import React, { useEffect } from 'react'
import ReactGA from 'react-ga';
import { connect } from 'react-redux'
import './database.css'
import '../../index.css'
import Header from '../../components/header/Header'
import mysql from '../../assets/mysql.svg'
import postgresql from '../../assets/postgresql.svg'
import mongodb from '../../assets/mongodb.svg'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import Documentation from '../../components/documentation/Documentation'
import DatabaseCardList from '../../components/database-card/DatabaseCardList'
import { Redirect } from "react-router-dom";
import { get, set } from "automate-redux";
import store from '../../store';
import { defaultDbConnectionStrings } from '../../constants';

function Database(props) {
  const cards = [{ graphics: mysql, name: "MySQL", desc: "The world's most popular open source database.", key: "sql-mysql" },
  { graphics: postgresql, name: "PostgreSQL", desc: "The world's most advanced open source database.", key: "sql-postgres" },
  { graphics: mongodb, name: "MongoDB", desc: "A open-source cross-platform document- oriented database.", key: "mongo" }]

  useEffect(() => {
    ReactGA.pageview("/projects/database");
  }, [])

  if (props.selectedDb) {
    return <Redirect to={`/mission-control/projects/${props.projectId}/database/overview/${props.selectedDb}`} />;
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
          <DatabaseCardList cards={cards} handleEnable={props.handleEnable} />
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  const crudModule = get(state, "config.modules.crud", {})
  const selectedDb = Object.keys(crudModule).find(db => {
    return crudModule[db].enabled
  })
  return {
    projectId: ownProps.match.params.projectId,
    selectedDb: selectedDb,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleEnable(key) {
      const defaultRules = JSON.stringify({
        create: {
          rule: 'allow'
        },
        read: {
          rule: 'allow'
        },
        update: {
          rule: 'allow'
        },
        delete: {
          rule: 'allow'
        }
      }, null, 2)
      
      let dbConfig = Object.assign({}, get(store.getState(), `config.modules.crud.${key}`, {}))
      if (!dbConfig.collections) {
        dbConfig.collections = {}
      }
      if (!dbConfig.collections.events_log) {
        dbConfig.collections.events_log = {
          isRealtimeEnabled: false,
          schema: `type events_log {
_id: ID! @id
batchid: String
type: String
token: Integer
timestamp: Integer
event_timestamp: Integer
payload: String
status: String
retries: Integer
service: String
function: String              
}`,
          rules: defaultRules
        }
      }
      if (!dbConfig.collections.default) {
        dbConfig.collections.default = {
          isRealtimeEnabled: true,
          rules: defaultRules
        }
      }
      if (!dbConfig.conn) {
        dbConfig.conn = defaultDbConnectionStrings[key]
      }
      dbConfig.enabled = true
      dispatch(set(`config.modules.crud.${key}`, dbConfig))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Database);
