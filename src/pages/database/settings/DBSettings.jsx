import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from 'react-redux';
import { Button, Divider, Popconfirm, Form, Input, Alert, Row, Col } from "antd"
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import DBTabs from '../../../components/database/db-tabs/DbTabs';
import { notify, getDatabaseLabelFromType, incrementPendingRequests, decrementPendingRequests, openSecurityRulesPage, setLastUsedValues } from '../../../utils';
import { modifyDbSchema, reloadDbSchema, changeDbName, removeDbConfig, disableDb, getDbName, getDbType, isPreparedQueriesSupported, changeLimitClause, getLimitClause, getDriverConfig, changeDriverConfig } from "../../../operations/database"
import { dbTypes, securityRuleGroups, projectModules, actionQueuedMessage } from '../../../constants';
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { getEventingDbAliasName } from '../../../operations/eventing';
import DriverConfig from '../../../components/database/settings/driver-config/DriverConfig';
import EditDriverConfigForm from '../../../components/database/settings/driver-config/EditDriverConfigForm';

const Settings = () => {
  // Router params
  const { projectID, selectedDB } = useParams()
  const history = useHistory()

  const [dbNameForm] = Form.useForm();
  const [limitClauseForm] = Form.useForm();

  // Global state
  const eventingDB = useSelector(state => getEventingDbAliasName(state))
  const dbName = useSelector(state => getDbName(state, projectID, selectedDB))
  const type = useSelector(state => getDbType(state, selectedDB))
  const preparedQueriesSupported = useSelector(state => isPreparedQueriesSupported(state, selectedDB))
  const limitClause = useSelector(state => getLimitClause(state, selectedDB))
  const driverConfig = useSelector(state => getDriverConfig(state, selectedDB))
  const [editDriverConfigModalVisible, setEditDriverConfigModalVisible] = useState(false)

  // Derived state
  const canDisableDB = eventingDB !== selectedDB
  const databaseLabel = getDatabaseLabelFromType(type)
  let databaseLabelName = "Database name"
  let databaseLabelDescription = `The logical database inside ${databaseLabel} that Space Cloud will connect to. Space Cloud will create this database if it doesn’t exist already`
  if (type === dbTypes.POSTGRESQL || type === dbTypes.SQLSERVER) {
    databaseLabelName = `${databaseLabel} schema`
    databaseLabelDescription = `The schema inside ${databaseLabel} database that Space Cloud will connect to. Space Cloud will create this schema if it doesn’t exist already.`
  }

  // This is used to bind the form initial values on page reload. 
  // On page reload the redux is intially empty leading the form initial values to be empty. 
  // Hence as soon as redux gets the desired value, we set the form values   
  useEffect(() => {
    if (dbName) {
      dbNameForm.setFieldsValue({ dbName: dbName })
    }
  }, [dbName])

  // Handlers
  const handleDisable = () => {
    incrementPendingRequests()
    disableDb(projectID, selectedDB)
      .then(({ queued, disabledEventing }) => {
        if (!queued) {
          notify("success", "Success", "Disabled database successfully")
          history.push(`/mission-control/projects/${projectID}/database/${selectedDB}`)
          if (disabledEventing) {
            notify("warn", "Warning", "Eventing is auto disabled. Enable it by changing eventing db or adding a new db")
          }
          return
        }
        notify("success", "Success", actionQueuedMessage)
      })
      .catch(ex => notify("error", "Error disabling database", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleConfigureDefaultTableRule = () => openSecurityRulesPage(projectID, securityRuleGroups.DB_COLLECTIONS, "default", selectedDB)
  const handleConfigureDefaultPreparedQueriesRule = () => openSecurityRulesPage(projectID, securityRuleGroups.DB_PREPARED_QUERIES, "default", selectedDB)

  const handleReloadDB = () => {
    incrementPendingRequests()
    reloadDbSchema(projectID, selectedDB)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Reloaded database schema successfully"))
      .catch(ex => notify("error", "Error reloading database schema", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleModifyDB = () => {
    incrementPendingRequests()
    modifyDbSchema(projectID, selectedDB)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Modified database schema successfully"))
      .catch(ex => notify("error", "Error modifying database schema", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleChangeDBName = ({ dbName }) => {
    incrementPendingRequests()
    let msg = "database"
    if (type === dbTypes.POSTGRESQL || type === dbTypes.SQLSERVER) msg = "schema"
    changeDbName(projectID, selectedDB, dbName)
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : `Changed ${msg} setting successfully`)
      })
      .catch(ex => notify("error", `Error changing  ${msg}`, ex))
      .finally(() => decrementPendingRequests())
  }

  const handleChangeLimitClause = ({ limitClause }) => {
    incrementPendingRequests()
    changeLimitClause(projectID, selectedDB, Number(limitClause))
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : `Changed default limit clause setting successfully`)
      })
      .catch(ex => notify("error", `Error changing  default limit clause`, ex))
      .finally(() => decrementPendingRequests())
  }

  const handleChangeDriverConfig = ( config ) => {
    incrementPendingRequests()
    changeDriverConfig(projectID, selectedDB, config)
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : `Changed driver config setting successfully`)
      })
      .catch(ex => notify("error", `Error changing driver config`, ex))
      .finally(() => decrementPendingRequests())
  }

  const handleRemoveDb = () => {
    incrementPendingRequests()
    removeDbConfig(projectID, selectedDB)
      .then(({ queued, disabledEventing }) => {
        if (!queued) {
          setLastUsedValues(projectID, { db: "" });
          history.push(`/mission-control/projects/${projectID}/database`)
          notify("success", "Success", "Successfully removed database config")
          if (disabledEventing) {
            notify("warn", "Warning", "Eventing is auto disabled. Enable it by changing eventing db or adding a new db")
          }
          return
        }
        notify("success", "Success", actionQueuedMessage)
      })
      .catch(ex => notify("error", "Error removing database config", ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar
        showProjectSelector
        showDbSelector
      />
      <div>
        <Sidenav selectedItem={projectModules.DATABASE} />
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
            <Form layout="vertical" form={dbNameForm} onFinish={handleChangeDBName} style={{ width: 300, marginTop: 16 }} initialValues={{ dbName: dbName }}>
              <Form.Item name="dbName" initialValue={dbName} rules={[{ required: true, message: 'Please provide database/schema name' }]}>
                <Input placeholder="" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Save</Button>
              </Form.Item>
            </Form>
            <Divider style={{ margin: "16px 0px" }} />
            {type !== dbTypes.EMBEDDED && <Row>
              <Col span={12}>
                <DriverConfig 
                dbType={type}
                config={driverConfig} 
                handleEditDriverConfig={() => setEditDriverConfigModalVisible(true)} />
                <Divider style={{ margin: "16px 0px" }} />
              </Col>
            </Row>}
            <FormItemLabel name="Default rules for tables/collections" description="Used when a table/collection doesn’t have a rule specified." />
            <Button onClick={handleConfigureDefaultTableRule}>Configure</Button>
            {preparedQueriesSupported &&
              <React.Fragment>
                <Divider style={{ margin: "16px 0px" }} />
                <FormItemLabel name="Default rules for prepared queries" description="Used when a prepared query doesn’t have a rule specified." />
                <Button onClick={handleConfigureDefaultPreparedQueriesRule}>Configure</Button>
              </React.Fragment>
            }
            <Divider style={{ margin: "16px 0px" }} />
            <FormItemLabel name="Default limit clause" hint="(default: 1000)" description="The limit clause to be imposed when no limit clause is specified in db read operations." />
            <Form form={limitClauseForm} style={{ width: 160, marginTop: 16 }} onFinish={handleChangeLimitClause} initialValues={{ limitClause: limitClause ? limitClause : 1000 }}>
              <Form.Item name="limitClause" initialValue={limitClause} rules={[{ required: true, message: 'Please input default limit clause' }]}>
                <Input addonAfter='rows' />
              </Form.Item>
              <Form.Item>
                <Button htmlType='submit'>Save</Button>
              </Form.Item>
            </Form>
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
            {editDriverConfigModalVisible && <EditDriverConfigForm
              dbType={type} 
              initialValues={driverConfig}
              handleSubmit={handleChangeDriverConfig}
              handleCancel={() => setEditDriverConfigModalVisible(false)}
              />}
          </div>
        </div>
      </div>
    </React.Fragment >
  );
};

export default Settings