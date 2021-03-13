import React from 'react';
import { dbTypes, defaultDbConnectionStrings } from '../../../constants';
import { Input, Button, Alert, Radio, Form, Checkbox, AutoComplete, Slider, Switch, Space, Divider } from 'antd';
import postgresIcon from '../../../assets/postgresIcon.svg'
import mysqlIcon from '../../../assets/mysqlIcon.svg'
import mongoIcon from '../../../assets/mongoIcon.svg'
import sqlserverIcon from '../../../assets/sqlserverIcon.svg'
import embeddedIcon from '../../../assets/embeddedIcon.svg'
import './create-db.css'
import { useSelector } from 'react-redux';
import { getDatabaseLabelFromType } from "../../../utils"
import RadioCards from "../../radio-cards/RadioCards"
import FormItemLabel from "../../../redesign-components/form-item-label/FormItemLabel"
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

const AutomatedBackupSwitch = ({ value, onChange }) => {
  return (
    <React.Fragment>
      Disable <Switch style={{ margin: "0px 10px" }} checked={value} onChange={checked => onChange(checked)} /> Enable <br />
      <span className="hint">Backups are retained for 7 days</span>
    </React.Fragment>
  )
}

const CreateDatabase = (props) => {
  const [form] = Form.useForm();
  const envSecrets = props.envSecrets ? props.envSecrets : [];
  const formInitialValues = { method: "new", model: "shared", alias: dbTypes.MONGO, dbType: dbTypes.MONGO, conn: defaultDbConnectionStrings[dbTypes.MONGO], loadFromSecret: false, dbName: props.projectId }
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

  const ModelRadioButtons = ({ value, onChange }) => {
    return (
      <React.Fragment>
        <Radio.Group value={value} onChange={e => onChange(e.target.value)}>
          <Radio value="new">Provision new database</Radio>
          <Radio value="existing">Add existing database</Radio>
        </Radio.Group>
        <Divider type="vertical" />
        <Button
          type="link"
          style={{ color: "#1D66FF", backgroundColor: "rgba(29, 102, 255, 0.1)" }}
          onClick={props.handleSkipAddDatabase}
        >
          Skip this step
        </Button>
      </React.Fragment>
    )
  }

  const alertMsg = <div>
    <b>Note:</b> If your database is running inside a docker container, use the container IP address of that docker container as the host in the connection string.
  </div>

  return (
    <Form
      layout="horizontal"
      colon={false}
      labelAlign="left"
      labelCol={{ span: 3 }}
      form={form}
      onFinish={handleOnFinish}
      initialValues={formInitialValues}
      onValuesChange={handleValuesChange}
    >
      <Form.Item name="method">
        <ModelRadioButtons />
      </Form.Item>
      <FormItemLabel name="Select a database" />
      <Form.Item name="dbType" rules={[{ required: true, message: "Please select a database type!" }]}>
        <RadioCards size="large">
          <Radio.Button value="mongo" size="large">
            <img src={mongoIcon} alt="mongo" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>MongoDB</span>
          </Radio.Button>
          <Radio.Button value="postgres">
            <img src={postgresIcon} alt="postgres" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>PostgreSQL</span>
          </Radio.Button>
          <Radio.Button value="mysql">
            <img src={mysqlIcon} alt="mysql" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>MySQL</span>
          </Radio.Button>
          <Radio.Button value="sqlserver">
            <img src={sqlserverIcon} alt="sqlserver" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>SQL Server</span>
          </Radio.Button>
          <Radio.Button value="embedded">
            <img src={embeddedIcon} alt="embedded" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>Embedded</span>
          </Radio.Button>
        </RadioCards>
      </Form.Item>
      <ConditionalFormBlock dependency="method" condition={() => form.getFieldValue("method") === "new"}>
        <Form.Item name="model">
          <Radio.Group>
            <Radio value="shared">Shared</Radio>
            <Radio value="dedicated">Dedicated</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="name" label="Name">
          <Input placeholder="eg: MyDB1" style={{ maxWidth: 300 }} />
        </Form.Item>
        <ConditionalFormBlock dependency="model" condition={() => form.getFieldValue("model") === "shared"}>
          <p style={{ fontWeight: 400 }}>In a shared environment, you get 1GB of space for your project</p>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="model" condition={() => form.getFieldValue("model") === "dedicated"}>
          <Form.Item name="computation" label="Computation">
            <RadioCards size="large">
              <Radio.Button value="2/8" size="large">
                <span style={{ lineHeight: "22px" }}>CPU: 2 <br /> RAM: 8GB</span>
              </Radio.Button>
              <Radio.Button value="2/16">
                <span style={{ lineHeight: "22px" }}>CPU: 2 <br /> RAM: 16GB</span>
              </Radio.Button>
              <Radio.Button value="3/16">
                <span style={{ lineHeight: "22px" }}>CPU: 3 <br /> RAM: 16GB</span>
              </Radio.Button>
              <Radio.Button value="3/32">
                <span style={{ lineHeight: "22px" }}>CPU: 3 <br /> RAM: 32GB</span>
              </Radio.Button>
              <Radio.Button value="4/32">
                <span style={{ lineHeight: "22px" }}>CPU: 4 <br /> RAM: 32GB</span>
              </Radio.Button>
            </RadioCards>
          </Form.Item>
          <Form.Item name="storage" label="Storage">
            <Slider style={{ maxWidth: 568 }} min={20} max={1000} marks={{ 20: "20GB", 1000: "1TB" }} />
          </Form.Item>
          <Form.Item name="backup" label="Automated Backup">
            <AutomatedBackupSwitch />
          </Form.Item>
        </ConditionalFormBlock>
      </ConditionalFormBlock>
      <ConditionalFormBlock dependency="method" condition={() => form.getFieldValue("method") === "existing"}>
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
        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.dbType !== curr.dbType} dependencies={["dbType"]}>
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
        <Form.Item name="dbName" rules={[{ required: true, message: 'Please input a Database Name' }]}>
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
        <Form.Item shouldUpdate={(prev, curr) => prev.alias !== curr.alias} dependencies={["alias"]}>
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
      </ConditionalFormBlock>
      <Space style={{ float: "right" }}>
        <Button type="primary" ghost size="large" onClick={props.handleOnBackClick}>Back</Button>
        <Button type="primary" size="large" htmlType="submit">Add Database</Button>
      </Space>
    </Form>
  );
}

export default CreateDatabase;