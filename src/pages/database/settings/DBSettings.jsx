import React, { useState } from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';

import { Button, Divider, Tooltip, Input } from "antd"
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { getProjectConfig, notify } from '../../../utils';
import { setDBConfig, handleReload, handleModify } from '../dbActions';

const Settings = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  const {DBAlias, setText} = useState('');

  // Global state
  const projects = useSelector(state => state.projects)

  // Derived properties
  const eventingDB = getProjectConfig(projects, projectID, "modules.eventing.dbType")
  const canDisableDB = eventingDB !== selectedDB

  const history = useHistory()

  // Handlers
  const handleDisable = () => {
    let conn = getProjectConfig(projects, projectID, `modules.crud.${selectedDB}.conn`)
    setDBConfig(projectID, selectedDB, false, conn)
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

  const handleDBAlias = () => {
    console.log(DBAlias)
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
            <h3>DB Alias</h3>
            <p>The name to identify the database from frontend</p>
            <Input onChange={(e) => setText(e.target.value)} style={{width: '25%'}}></Input><br /><br />
            <Button onClick={handleDBAlias}>Save</Button>
            <Divider />
            <h3>Reload schema</h3>
            <p>Refresh Space Cloud schema, typically required if you have changed the underlying database</p>
            <Button onClick={handleReloadDB}>Reload</Button>
            <Divider />
            <h3>Setup DB</h3>
            <p>Modifies database as per Space Cloud schema, typically required if you have dropped or modified the underlying database</p>
            <Button onClick={handleModifyDB}>Setup</Button>
            <Divider />
            <h3>Disable database</h3>
            <p>Disables all access to this database</p>
            {!canDisableDB && <Tooltip placement="right" title="This database is used for eventing. First change the eventing database from the config section" arrowPointAtCenter>
              <Button type="danger" disabled >Disable</Button>
            </Tooltip>}
            {canDisableDB && <Button type="danger" onClick={handleDisable} >Disable</Button>}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Settings