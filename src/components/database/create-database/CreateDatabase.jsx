import React from 'react';
import { dbTypes, defaultDbConnectionStrings } from '../../../constants';
import { Card, Input, Button, Alert, Radio, Form, Checkbox, AutoComplete } from 'antd';
import postgresIcon from '../../../assets/postgresIcon.svg'
import mysqlIcon from '../../../assets/mysqlIcon.svg'
import mongoIcon from '../../../assets/mongoIcon.svg'
import sqlserverIcon from '../../../assets/sqlserverIcon.svg'
import embeddedIcon from '../../../assets/embeddedIcon.svg'
import './create-db.css'
import { useSelector } from 'react-redux';
import { getDatabaseLabelFromType } from "../../../utils"
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
import { getDbConfigs } from '../../../operations/database';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';

const CreateDatabase = (props) => {
  const [form] = Form.useForm();
  const envSecrets = props.envSecrets ? props.envSecrets : [];
  const formInitialValues = { alias: dbTypes.MONGO, dbType: dbTypes.MONGO, conn: defaultDbConnectionStrings[dbTypes.MONGO], loadFromSecret: false }
  const dbconfig = useSelector(state => getDbConfigs(state))

  const dbAliasNames = dbconfig ? Object.keys(dbconfig) : [];

  const handleOnFinish = ({ alias, dbType, conn, secret, dbName }) => {
    let connectionString;
    if (secret) {
      connectionString = `secrets.${secret}`;
    } else {
      connectionString = conn
    }
    props.handleSubmit(alias, connectionString, dbType, dbName)
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
        <Form.Item name='loadFromSecret' valuePropName='checked'>
          <Checkbox>Load connection string from a secret</Checkbox>
        </Form.Item>
        <ConditionalFormBlock
          dependency='loadFromSecret'
          condition={() => form.getFieldValue('loadFromSecret') === false}
        >
          <Form.Item name="conn" rules={[{ required: true, message: 'Please input a connection string' }]}>
            <Input.Password placeholder="eg: mongodb://localhost:27017" />
          </Form.Item>
          <Alert
            message={alertMsg}
            type="info"
            showIcon />
          <br />
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency='loadFromSecret'
          condition={() => form.getFieldValue('loadFromSecret') === true}
        >
          <Form.Item name="secret" rules={[{ required: true, message: 'Please input a secret name' }]}>
            <AutoComplete placeholder="secret name" options={envSecrets.map(secret => ({ value: secret }))} />
          </Form.Item>
        </ConditionalFormBlock>
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.dbType != curr.dbType} dependencies={["dbType"]}>
          {() => {
            const dbType = form.getFieldValue("dbType")
            const databaseLabel = getDatabaseLabelFromType(dbType)
            let labelName = "Database name"
            let labelDescription = `The logical database inside ${databaseLabel} that Space Cloud will connect to. Space Cloud will create this database if it doesn’t exist already`
            if (dbType === dbTypes.POSTGRESQL || dbType === dbTypes.SQLSERVER) {
              labelName = `${databaseLabel} schema`
              labelDescription = `The schema inside ${databaseLabel} database that Space Cloud will connect to. Space Cloud will create this schema if it doesn’t exist already.`
            }
            return (
              <FormItemLabel name={labelName} description={labelDescription} />
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
            if (check && !props.ignoreDbAliasCheck) {
              cb("Alias name already taken by another database. Please provide an unique alias name!")
              return
            }
            cb()
          }
        }]}>
          <Input placeholder="eg: mongo" />
        </Form.Item>
        <Form.Item shouldUpdate={(prev, curr) => prev.alias != curr.alias} dependencies={["alias"]}>
          {() => {
            const aliasValue = form.getFieldValue("alias")
            try {
              const data = aliasValue.length > 0 ? (gqlPrettier(
                `{ query { 
                    articles @${aliasValue} { 
                    id 
                    name 
                  }
                }}`
              )) : ("")
              return (
                <React.Fragment>
                  <FormItemLabel name="Example GraphQL query:" hint="Query articles tables (Note the alias directive):" />
                  <CodeMirror
                    value={data}
                    className="add-database-code-mirror"
                    options={{
                      mode: { name: "javascript", json: true },
                      lineNumbers: true,
                      styleActiveLine: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      tabSize: 2,
                      autofocus: true,
                      readOnly: true
                    }}
                  />
                </React.Fragment>
              )
            } catch (error) {
              return null
            }
          }}
        </Form.Item>
        <Form.Item noStyle>
          <Button type="primary" htmlType="submit" block>Add database</Button>
        </Form.Item>
      </Form>
    </Card >
  );
}

export default CreateDatabase;