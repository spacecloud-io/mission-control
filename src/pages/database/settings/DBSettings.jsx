import React from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "automate-redux";
import { Button, Divider, Tooltip, Input } from "antd"
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { getProjectConfig, notify } from '../../../utils';
import { setDBConfig, handleReload, handleModify, removeDBConfig} from '../../../actions/database';

const Settings = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects)

  // Derived properties
  const eventingDB = getProjectConfig(projectID, "modules.eventing.dbType")
  const canDisableDB = eventingDB !== selectedDB

  const history = useHistory()

  // Handlers
  const handleDisable = () => {
    let conn = getProjectConfig(projectID, `modules.crud.${selectedDB}.conn`)
    setDBConfig(projectID, selectedDB, false, conn)
      .then(() => {
        notify("success", "Success", "Disabled database successfully")
        history.push(`/mission-control/projects/${projectID}/database/${selectedDB}`)
      })
      .catch(ex => notify("error", "Error", ex))
  }

  const handleReloadDB = () => {
    dispatch(increment("pendingRequests"))
    handleReload(projectID, selectedDB)
      .then(() => notify("success", "Success", "Reloaded schema successfully"))
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleModifyDB = () => {
    dispatch(increment("pendingRequests"))
    handleModify(projectID, selectedDB)
      .then(() => notify("success", "Success", "Setup database successfully"))
      .catch(ex => notify("error", "Error", ex))
      .finally(()=>dispatch(decrement("pendingRequests")))
  }

  const handleRemoveDb = () => {
    dispatch(increment("pendingRequests"))
    removeDBConfig(projectID, selectedDB)
      .then(()=>notify("success", "Success", "Removed database config successfully"))
      .catch((ex)=>notify("error", "Error removing database config", ex))
      .finally(()=>dispatch(decrement("pendingRequests")))
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
            {!canDisableDB && <Tooltip placement="right" title="This database is used for eventing. First change the eventing database from the config section" arrowPointAtCenter>
              <Button type="danger" disabled>Disable</Button>
            </Tooltip>}
            {canDisableDB && <Button type="danger" onClick={handleDisable} >Disable</Button>}
            <Divider style={{ margin: "16px 0px" }} />
            <h3>Remove Config</h3>
            <p>Removes the config (schema, rules, etc.) of this database without dropping any tables or database</p>
            {!canDisableDB && <Tooltip placement="right" title="This database is used for eventing. First change the eventing database from the config section" arrowPointAtCenter>
              <Button type="danger" disabled>Remove</Button>
            </Tooltip>}
            {canDisableDB && <Button type="danger" onClick={handleRemoveDb} >Remove</Button>}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Settings