import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from 'react-redux';
import { Button, Divider, Popconfirm, Form, Input, Alert } from "antd"
import ReactGA from 'react-ga'
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { getProjectConfig, notify, getDatabaseLabelFromType, getDBTypeFromAlias, canDatabaseHavePreparedQueries } from '../../../utils';
import { setDBConfig, handleReload, handleModify, removeDBConfig, changeDatabaseName, changeDatabaseAliasName, setPreparedQueries } from '../dbActions';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import gqlPrettier from 'graphql-prettier';
import { dbTypes } from '../../../constants';
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { decrement, increment } from 'automate-redux';

const Settings = () => {
  // Router params
  const { projectID, selectedDB } = useParams()

  const history = useHistory()
  const dispatch = useDispatch()

  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

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

  const dbModule = getProjectConfig(projects, projectID, `modules.db`)
  const dbAliasNames = (dbModule ? Object.keys(dbModule) : []).filter(value => value !== selectedDB);

  // Handlers
  const handleDisable = () => {
    let conn = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.conn`)
    let dbType = getDBTypeFromAlias(projectID, selectedDB)
    let dbName = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.name`)
    dispatch(increment("pendingRequests"))
    setDBConfig(projectID, selectedDB, false, conn, dbType, dbName, false)
      .then(() => {
        notify("success", "Success", "Disabled database successfully")
        history.push(`/mission-control/projects/${projectID}/database/${selectedDB}`)
      })
      .catch(ex => notify("error", "Error disabling database", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
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

  const handleChangeDBName = ({ dbName }) => {
    dispatch(increment("pendingRequests"))
    changeDatabaseName(projectID, selectedDB, dbName)
      .then(() => {
        let msg = "database"
        if (type === dbTypes.POSTGRESQL || type === dbTypes.SQLSERVER) msg = "schema"
        notify("success", "Success", `Changed ${msg} setting successfully`)
      })
      .catch(ex => notify("error", "Error changing database", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleRemoveDb = () => {
    dispatch(increment("pendingRequests"))
    removeDBConfig(projectID, selectedDB)
      .then(() => {
        history.push(`/mission-control/projects/${projectID}/database`)
        notify("success", "Success", "Successfully removed database config")
      })
      .catch(ex => notify("error", "Error removing database config", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleChangeAliasName = ({ aliasName }) => {
    dispatch(increment("pendingRequests"))
    changeDatabaseAliasName(projectID, selectedDB, aliasName)
      .then(() => {
        notify("success", "Success", "Successfully changed database alias name")
        history.replace(`/mission-control/projects/${projectID}/database/${aliasName}/settings`)
      })
      .catch(ex => notify("error", "Error changing database alias name", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const handleChangeDefaultPreparedQueryRule = () => {
    try {
      setPreparedQueries(projectID, selectedDB, "default", [], "", JSON.parse(defaultPreparedQueryRuleString))
        .then(() => notify("success", "Success", "Successfully changed default security rules of prepared queries"))
        .catch(ex => notify("error", "Error changing default security rules of prepared queries", ex))
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
            <Divider style={{ margin: "16px 0px" }} />
            <FormItemLabel name="Alias name" description="Alias name is used in your frontend queries to identify your database" />
            <Form layout="vertical" form={form1} onFinish={handleChangeAliasName}>
              <div style={{ width: 300 }}>
                <Form.Item name="aliasName"
                  initialValue={selectedDB}
                  rules={[{
                    validator: (_, value, cb) => {
                      if (!value) {
                        cb("Please input an alias for your database")
                        return
                      }
                      if (!(/^[0-9a-zA-Z_]+$/.test(value))) {
                        cb("Alias name can only contain alphanumeric characters and underscores!")
                        return
                      }
                      const check = dbAliasNames.some(data => value === data);
                      if (check) {
                        cb("Alias name already taken by another database. Please provide an unique alias name!")
                        return
                      }
                      cb()
                    }
                  }]}>
                  <Input placeholder="" />
                </Form.Item>
              </div>
              <Form.Item>
                <Button htmlType="submit">Save</Button>
              </Form.Item>
              <div style={{ width: 600 }}>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.aliasName != curr.aliasName} dependencies={["aliasName"]}>
                  {() => {
                    const aliasValue = form1.getFieldValue("aliasName")
                    try {
                      const data = gqlPrettier(
                        `{query { 
                          articles @${aliasValue} { 
                          id 
                          name 
                        }
                      }}`
                      )
                      return (
                        <React.Fragment>
                          <FormItemLabel name="Example GraphQL query:" hint="Query articles tables (Note the alias directive):" />
                          <CodeMirror
                            value={data}
                            options={{
                              mode: { name: "javascript", json: true },
                              lineNumbers: true,
                              styleActiveLine: true,
                              matchBrackets: true,
                              autoCloseBrackets: true,
                              tabSize: 2,
                              autofocus: true
                            }}
                          />
                        </React.Fragment>
                      )
                    } catch (error) {
                      return null
                    }
                  }}
                </Form.Item>
              </div>
            </Form>
            {canDatabaseHavePreparedQueries(projectID, selectedDB) &&
              <React.Fragment>
                <Divider style={{ margin: "16px 0px" }} />
                <Form layout="vertical" form={form2} onFinish={handleChangeDefaultPreparedQueryRule}>
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
            <FormItemLabel name="Setup DB" description="Modifies database as per Space Cloud schema, typically required if you have dropped or modified the underlying database" />
            <Button onClick={handleModifyDB}>Setup</Button>
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