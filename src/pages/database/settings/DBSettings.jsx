import React, { useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';
import { Button, Divider, Tooltip, Popconfirm } from "antd"
import ReactGA from 'react-ga'
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { getProjectConfig, notify } from '../../../utils';
import { setDBConfig, handleReload, handleModify, removeDBConfig } from '../dbActions';

const Settings = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  useEffect(() => {
    ReactGA.pageview("/projects/database/settings");
  }, [])
  // Global state
  const projects = useSelector(state => state.projects)

  // Derived properties
  const eventingDB = getProjectConfig(projects, projectID, "modules.eventing.dbAlias")
  const canDisableDB = eventingDB !== selectedDB

  const history = useHistory()

  // Handlers
  const handleDisable = () => {
    let conn = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.conn`)
    let dbType = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.type`)
    setDBConfig(projectID, selectedDB, false, conn, dbType)
      .then(() => {
        notify("success", "Success", "Disabled database successfully")
        history.push(`/mission-control/projects/${projectID}/database/${selectedDB}`)
      })
      .catch(ex => notify("error", "Error", ex))
  }

  const handleReloadDB = () => {
    handleReload(projectID, selectedDB)
      .then(() => notify("success", "Success", "Reloaded schema successfully"))
      .catch(ex => notify("error", "Error", ex))
  }

  const handleModifyDB = () => {
    handleModify(projectID, selectedDB)
      .then(() => notify("success", "Success", "Setup database successfully"))
      .catch(ex => notify("error", "Error", ex))
  }

  const handleRemoveDb = () => {
    removeDBConfig(projectID, selectedDB)
  }

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem='database' />
        <div className='page-content page-content--no-padding'>
          <DBTabs
            selectedDB={selectedDB}
            projectID={projectID}
            activeKey='settings'
          />
          <div className="db-tab-content">
            <h3>Reload schema</h3>
            <p>Refresh Space Cloud schema, typically required if you have changed the underlying database</p>
            <Button onClick={handleReloadDB}>Reload</Button>
            <Divider style={{ margin: "16px 0px" }} />
            <h3>Setup DB</h3>
            <p>Modifies database as per Space Cloud schema, typically required if you have dropped or modified the underlying database</p>
            <Button onClick={handleModifyDB}>Setup</Button>
            <Divider style={{ margin: "16px 0px" }} />
            <h3>Disable database</h3>
            <p>Disables all access to this database</p>
            <Popconfirm
              title={canDisableDB ? `This will disable all access to this database. Are you sure?`: `Eventing and realtime functionality will be disabled since this is the eventing db. Are you sure?`}
              onConfirm={handleDisable}
              okText="Yes, disable"
              cancelText="No"
            >
              <Button type="danger">Disable</Button>
            </Popconfirm>
            <Divider style={{ margin: "16px 0px" }} />
            <h3>Remove Config</h3>
            <p>Removes the config (schema, rules, etc.) of this database without dropping any tables or database</p>
            <Popconfirm
              title={canDisableDB ? `This will remove the database config and disable all access to this database. Are you sure?`: `Eventing and realtime functionality will be disabled since this is the eventing db. Are you sure?`}
              onConfirm={handleRemoveDb}
              okText="Yes, remove"
              cancelText="No"
            >
              <Button type="danger">Remove</Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Settings