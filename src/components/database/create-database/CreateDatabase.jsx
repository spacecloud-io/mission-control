import React from 'react';
import { dbTypes, defaultDbConnectionStrings, defaultDBRules } from '../../../constants';
import { Card, Input, Button, Alert, Radio, Form } from 'antd';
import postgresIcon from '../../../assets/postgresIcon.svg'
import mysqlIcon from '../../../assets/mysqlIcon.svg'
import mongoIcon from '../../../assets/mongoIcon.svg'
import sqlserverIcon from '../../../assets/sqlserverIcon.svg'
import embeddedIcon from '../../../assets/embeddedIcon.svg'
import './create-db.css'
import { useSelector } from 'react-redux';
import { getProjectConfig } from "../../../utils"
import RadioCards from "../../radio-cards/RadioCards"
import FormItemLabel from "../../form-item-label/FormItemLabel"
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import gqlPrettier from 'graphql-prettier';

const CreateDatabase = (props) => {
  const [form] = Form.useForm();
  const formInitialValues = { alias: dbTypes.MONGO, dbType: dbTypes.MONGO, conn: defaultDbConnectionStrings[dbTypes.MONGO] }
  const projects = useSelector(state => state.projects)
  const dbconfig = getProjectConfig(projects, props.projectId, `modules.db`)

  const dbAliasNames = dbconfig ? Object.keys(dbconfig) : [];

  const handleOnFinish = ({ alias, dbType, conn, dbName }) => {
    props.handleSubmit(alias, conn, defaultDBRules, dbType, dbName)
  }

  const handleValuesChange = (changedValues) => {
    if (changedValues.dbType) {
      form.setFieldsValue({
        alias: changedValues.dbType,
        conn: defaultDbConnectionStrings[changedValues.dbType],
      })
    }
  }

  const alertMsg = <div>
    <b>Note:</b> If your database is running inside a docker container, use the container IP address of that docker container as the host in the connection string.
  </div>

  return (
    <Card>
      <Form form={form} onFinish={handleOnFinish} initialValues={formInitialValues} onValuesChange={handleValuesChange} layout="vertical">
        <FormItemLabel name="Select a database" />
        <Form.Item name="dbType" rules={[{ required: true, message: "Please select a database type!" }]}>
          <RadioCards size="large">
            <Radio.Button value="mongo" size="large">
              <img src={mongoIcon} width="24px" height="24px" style={{ marginRight: 4 }} />
              <span>MongoDB</span>
            </Radio.Button>
            <Radio.Button value="postgres">
              <img src={postgresIcon} width="24px" height="24px" style={{ marginRight: 4 }} />
              <span>PostgreSQL</span>
            </Radio.Button>
            <Radio.Button value="mysql">
              <img src={mysqlIcon} width="24px" height="24px" style={{ marginRight: 4 }} />
              <span>MySQL</span>
            </Radio.Button>
            <Radio.Button value="sqlserver">
              <img src={sqlserverIcon} width="24px" height="24px" style={{ marginRight: 4 }} />
              <span>SQL Server</span>
            </Radio.Button>
            <Radio.Button value="embedded">
              <img src={embeddedIcon} width="24px" height="24px" style={{ marginRight: 4 }} />
              <span>Embedded</span>
            </Radio.Button>
          </RadioCards>
        </Form.Item>
        <FormItemLabel name="Provide a connection string" description="Space Cloud requires a connection string to connect to your database" />
        <Form.Item name="conn" rules={[{ required: true, message: 'Please input a connection string' }]}>
          <Input.Password placeholder="eg: mongodb://localhost:27017" />
        </Form.Item>
        <Alert
          message={alertMsg}
          type="info"
          showIcon />
        <br />
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.dbType != curr.dbType} dependencies={["dbType"]}>
          {() => {
            const dbType = form.getFieldValue("dbType")
            return (
              dbType === "mongo" || dbType === "embedded" || dbType === "mysql" ? (
                <div>
                  <h4><b>Database Name</b></h4>
                  <p>The logical database inside {dbType} that Space Cloud will connect to. Space Cloud will create this database if it doesn’t exist already</p>
                </div>
              ) : (
                  <div>
                    <h4><b>{dbType} schema </b></h4>
                    <p>The schema inside the {dbType} that Space Cloud will connect to. Space Cloud will create this schema if it doesn’t exist already</p>
                  </div>
                )
            )
          }}
        </Form.Item>
        <Form.Item name="dbName" initialValue={props.projectId} rules={[{ required: true, message: 'Please input a Database Name' }]}>
          <Input placeholder="" />
        </Form.Item>
        <FormItemLabel name="Alias" description="Alias name is used in your frontend queries to identify your database" />
        <Form.Item name="alias" dependencies={["dbType"]} shouldUpdate="true" rules={[{
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
          <Input placeholder="eg: mongo" />
        </Form.Item>
        {<h4><b>Example GraphQL query:</b> Query articles tables (Note the alias directive):</h4>}
        <div style={{ paddingBottom: 18 }}>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.alias != curr.alias} dependencies={["alias"]}>
            {() => {
              const aliasValue = form.getFieldValue("alias")
              console.log(aliasValue.length)
              const data = aliasValue.length > 0 ? (gqlPrettier(
                `{ query { 
                  articles @${aliasValue} { 
                  id 
                  name 
                }
              }}`
              )) : ("")
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
        <Form.Item>
          <Button type="primary" htmlType="submit" block>Add database</Button>
        </Form.Item>
      </Form>
    </Card >
  );
}

export default CreateDatabase;