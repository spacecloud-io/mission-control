import React, { useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';
import { Button, Divider, Tooltip, Popconfirm, Form, Input } from "antd"
import ReactGA from 'react-ga'
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { getProjectConfig, notify } from '../../../utils';
import { setDBConfig, handleReload, handleModify, removeDBConfig, dbEnable } from '../dbActions';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import gqlPrettier from 'graphql-prettier';

const Settings = () => {

  const [form] = Form.useForm();
  const [form1] = Form.useForm();
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

  const dbName = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.dbName`)
  const conn = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.conn`)
  const type = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.type`)
  const defaultRules = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.collections.default.rules`, {})

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

  const handleSubmit = ({ dbName }) => {
    dbEnable(projects, projectID, selectedDB, conn, defaultRules, type, dbName, (err) => {
      if (!err) {
        let msg;
        if (type === "mongo" || type === "embedded" || type === "mysql") msg = "Database"
        else msg = "Schema"
        handleModify(projectID, selectedDB)
          .then(() => notify("success", "Success", `Changed ${msg} setting successfully`))
          .catch(ex => notify("error", "Error", ex))
      }
    })
  }

  const handleClick = ({ aliasName }) => {
    removeDBConfig(projectID, selectedDB)
    dbEnable(projects, projectID, aliasName, conn, defaultRules, type, dbName, (err) => {
      if (!err) {
        handleModify(projectID, aliasName)
          .then(() => notify("success", "Success", "Changed alias name successfully"))
          .catch(ex => notify("error", "Error", ex))
      }
    })
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
            {type === "mongo" || type === "embedded" || type === "mysql" ? (
              <div>
                <h3>{type} Database</h3>
                <p>The {type} database that Space Cloud will connect to</p>
              </div>
            ) : (
                <div>
                  <h3>{type} Schema</h3>
                  <p>The schema inside the {type} database that Space Cloud will connect to</p>
                </div>
              )}
            <Form layout="vertical" form={form} onFinish={handleSubmit} style={{ width: 300 }}>
              <Form.Item name="dbName" initialValue={dbName} rules={[{ required: true, message: 'Please provide dbName' }]}>
                <Input placeholder="" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Save</Button>
              </Form.Item>
            </Form>
            <Divider style={{ margin: "16px 0px" }} />
            <h3>Alias name</h3>
            <p>Alias name is used in your frontend queries to identify your database</p>
            <Form layout="vertical" form={form1} onFinish={handleClick}>
              <div style={{ width: 300 }}>
                <Form.Item name="aliasName" initialValue={selectedDB} rules={[{ required: true, message: 'Please provide aliasName' }]}>
                  <Input placeholder="" />
                </Form.Item>
              </div>
              <Form.Item>
                <Button htmlType="submit">Save</Button>
              </Form.Item>
              {<h4><b>Example GraphQL query:</b> Query articles tables (Note the alias directive):</h4>}
              <div style={{ width: 600 }}>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.aliasName != curr.aliasName} dependencies={["aliasName"]}>
                  {() => {
                    const aliasValue = form1.getFieldValue("aliasName")
                    const data = gqlPrettier(
                      `{query { 
                        articles @${aliasValue} { 
                        id 
                        name 
                      }
                    }}`
                    )
                    return (
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
                    )
                  }}
                </Form.Item>
              </div>
            </Form>
            <Divider style={{ margin: "16px 0px" }} />
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
              title={canDisableDB ? `This will disable all access to this database. Are you sure?` : `Eventing and realtime functionality will be disabled since this is the eventing db. Are you sure?`}
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
    </React.Fragment>
  );
};

export default Settings