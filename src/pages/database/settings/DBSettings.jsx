import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { Button, Divider, Popconfirm, Form, Input, Alert } from "antd"
import ReactGA from 'react-ga'
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { getProjectConfig, notify, getDatabaseLabelFromType, canDatabaseHavePreparedQueries, incrementPendingRequests, decrementPendingRequests } from '../../../utils';
import { modifyDbSchema, reloadDbSchema, setPreparedQuerySecurityRule, changeDbName, removeDbConfig, disableDb } from "../../../operations/database"
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { dbTypes } from '../../../constants';
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";

const Settings = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  const history = useHistory()
  const dispatch = useDispatch()

  const [form] = Form.useForm();
  const [form1] = Form.useForm();

  useEffect(() => {
    ReactGA.pageview("/projects/database/settings");
  }, [])
  // Global state
  const projects = useSelector(state => state.projects)

  // Derived properties
  const eventingDB = getProjectConfig(projects, projectID, "modules.eventing.dbAlias")
  const canDisableDB = eventingDB !== selectedDB

  const dbName = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.name`, projectID)
  const type = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.type`)

  // This is used to bind the form initial values on page reload. 
  // On page reload the redux is intially empty leading the form initial values to be empty. 
  // Hence as soon as redux gets the desired value, we set the form values   
  useEffect(() => {
    if (dbName) {
      form.setFieldsValue({ dbName: dbName })
    }
  }, [dbName])

  const databaseLabel = getDatabaseLabelFromType(type)
  let databaseLabelName = "Database name"
  let databaseLabelDescription = `The logical database inside ${databaseLabel} that Space Cloud will connect to. Space Cloud will create this database if it doesn’t exist already`
  if (type === dbTypes.POSTGRESQL || type === dbTypes.SQLSERVER) {
    databaseLabelName = `${databaseLabel} schema`
    databaseLabelDescription = `The schema inside ${databaseLabel} database that Space Cloud will connect to. Space Cloud will create this schema if it doesn’t exist already.`
  }

  const defaultPreparedQueryRule = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.preparedQueries.default.rule`, {})
  const [defaultPreparedQueryRuleString, setDefaultPreparedQueryRuleString] = useState(JSON.stringify(defaultPreparedQueryRule, null, 2));

  // Handlers
  const handleDisable = () => {
    incrementPendingRequests()
    disableDb(projectID, selectedDB)
      .then((disabledEventing) => {
        notify("success", "Success", "Disabled database successfully")
        history.push(`/mission-control/projects/${projectID}/database/${selectedDB}`)
        if (disabledEventing) {
          notify("warn", "Warning", "Eventing is auto disabled. Enable it by changing eventing db or adding a new db")
        }
      })
      .catch(ex => notify("error", "Error disabling database", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleReloadDB = () => {
    incrementPendingRequests()
    reloadDbSchema(projectID, selectedDB)
      .then(() => notify("success", "Success", "Reloaded database schema successfully"))
      .catch(ex => notify("error", "Error reloading database schema", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleModifyDB = () => {
    incrementPendingRequests()
    modifyDbSchema(projectID, selectedDB)
      .then(() => notify("success", "Success", "Modified database schema successfully"))
      .catch(ex => notify("error", "Error modifying database schema", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleChangeDBName = ({ dbName }) => {
    incrementPendingRequests()
    let msg = "database"
    if (type === dbTypes.POSTGRESQL || type === dbTypes.SQLSERVER) msg = "schema"
    changeDbName(projectID, selectedDB, dbName)
      .then(() => {
        notify("success", "Success", `Changed ${msg} setting successfully`)
      })
      .catch(ex => notify("error", `Error changing  ${msg}`, ex))
      .finally(() => decrementPendingRequests())
  }

  const handleRemoveDb = () => {
    incrementPendingRequests()
    removeDbConfig(projectID, selectedDB)
      .then(() => {
        history.push(`/mission-control/projects/${projectID}/database`)
        notify("success", "Success", "Successfully removed database config")
      })
      .catch(ex => notify("error", "Error removing database config", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleChangeDefaultPreparedQueryRule = () => {
    try {
      incrementPendingRequests()
      setPreparedQuerySecurityRule(projectID, selectedDB, "default", JSON.parse(defaultPreparedQueryRuleString))
        .then(() => notify("success", "Success", "Successfully changed default security rules of prepared queries"))
        .catch(ex => notify("error", "Error changing default security rules of prepared queries", ex))
        .finally(() => decrementPendingRequests())
    } catch (ex) {
      notify("error", "Error changing default security rules of prepared queries", ex)
    }
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
            <FormItemLabel name={databaseLabelName} description={databaseLabelDescription} />
            <Alert
              style={{ width: "720px" }}
              message={<div><b>Note:</b> Changing this won't migrate any existing data from the old database/schema into the new one.</div>}
              type="info"
              showIcon />
            <Form layout="vertical" form={form} onFinish={handleChangeDBName} style={{ width: 300, marginTop: 16 }} initialValues={{ dbName: dbName }}>
              <Form.Item name="dbName" initialValue={dbName} rules={[{ required: true, message: 'Please provide database/schema name' }]}>
                <Input placeholder="" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Save</Button>
              </Form.Item>
            </Form>
            {canDatabaseHavePreparedQueries(selectedDB) &&
              <React.Fragment>
                <Divider style={{ margin: "16px 0px" }} />
                <Form layout="vertical" form={form1} onFinish={handleChangeDefaultPreparedQueryRule}>
                  <FormItemLabel name="Default rules for prepared queries" />
                  <div style={{ width: 600 }}>
                    <Form.Item >
                      <CodeMirror
                        value={defaultPreparedQueryRuleString}
                        options={{
                          mode: { name: "javascript", json: true },
                          lineNumbers: true,
                          styleActiveLine: true,
                          matchBrackets: true,
                          autoCloseBrackets: true,
                          tabSize: 2,
                          autofocus: true
                        }}
                        onBeforeChange={(editor, data, value) => {
                          setDefaultPreparedQueryRuleString(value)
                        }}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button htmlType="submit">Save</Button>
                    </Form.Item>
                  </div>
                </Form>
              </React.Fragment>
            }
            <Divider style={{ margin: "16px 0px" }} />
            <FormItemLabel name="Reload schema" description="Refresh Space Cloud schema, typically required if you have changed the underlying database" />
            <Button onClick={handleReloadDB}>Reload</Button>
            <Divider style={{ margin: "16px 0px" }} />
            <FormItemLabel name="Modify schema" description="Modifies database as per Space Cloud schema, typically required if you have dropped or modified the underlying database" />
            <Button onClick={handleModifyDB}>Modify</Button>
            <Divider style={{ margin: "16px 0px" }} />
            <FormItemLabel name="Disable database" description="Disables all access to this database" />
            <Popconfirm
              title={canDisableDB ? `This will disable all access to this database. Are you sure?` : `Eventing and realtime functionality will be disabled since this is the eventing db. Are you sure?`}
              onConfirm={handleDisable}
              okText="Yes, disable"
              cancelText="No"
            >
              <Button type="danger">Disable</Button>
            </Popconfirm>
            <Divider style={{ margin: "16px 0px" }} />
            <FormItemLabel name="Remove Config" description="Removes the config (schema, rules, etc.) of this database without dropping any tables or database" />
            <Popconfirm
              title={canDisableDB ? `This will remove the database config and disable all access to this database. Are you sure?` : `Eventing and realtime functionality will be disabled since this is the eventing db. Are you sure?`}
              onConfirm={handleRemoveDb}
              okText="Yes, remove"
              cancelText="No"
            >
              <Button type="danger">Remove</Button>
            </Popconfirm>
          </div>
        </div>
      </div>
    </React.Fragment >
  );
};

export default Settings