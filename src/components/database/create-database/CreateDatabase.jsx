import React, { useState } from 'react';
import { dbTypes, defaultDbConnectionStrings, defaultDBRules } from '../../../constants';
import { Row, Col, Card, Form, Input, Button, Alert, Radio } from 'antd';
import StarterTemplate from '../../starter-template/StarterTemplate';
import postgresIcon from '../../../assets/postgresIcon.svg'
import mysqlIcon from '../../../assets/mysqlIcon.svg'
import mongoIcon from '../../../assets/mongoIcon.svg'
import sqlserverIcon from '../../../assets/sqlserverIcon.svg'
import { dbEnable } from '../../../pages/database/dbActions'
import './create-db.css'
import { useSelector } from 'react-redux';
import { Link, useParams, useHistory } from 'react-router-dom';
import RadioCard from '../../radio-card/RadioCard';
import { getProjectConfig, setProjectConfig } from "../../../utils"
import { validate } from 'graphql';

const CreateDatabase = (props) => {
  const history = useHistory()
  const [selectedDB, setSelectedDB] = useState(dbTypes.MONGO);
  const [alias, setAlias] = useState("mongo");
  const projects = useSelector(state => state.projects)
  const dbconfig = getProjectConfig(projects, props.projectId, `modules.crud`)

  const dbAliasNames = dbconfig ? Object.keys(dbconfig) : "";
  const { getFieldDecorator, setFieldsValue, getFieldValue, validateFields } = props.form;

  const handleMongo = () => {
    setSelectedDB(dbTypes.MONGO);
    setFieldsValue({
      connectionString: defaultDbConnectionStrings[dbTypes.MONGO],
      alias: "mongo"
    });
  }

  const handlePostgres = () => {
    setSelectedDB(dbTypes.POSTGRESQL);
    setFieldsValue({
      connectionString: defaultDbConnectionStrings[dbTypes.POSTGRESQL],
      alias: "postgres"
    });
  }

  const handleMysql = () => {
    setSelectedDB(dbTypes.MYSQL);
    setFieldsValue({ connectionString: defaultDbConnectionStrings[dbTypes.MYSQL], alias: "mysql" });
  }

  const handleSqlServer = () => {
    setSelectedDB(dbTypes.SQLSERVER);
    setFieldsValue({ connectionString: defaultDbConnectionStrings[dbTypes.SQLSERVER], alias: "sqlserver" });
  }

  const handleDbSubmit = () => {
    validateFields((err, values) => {
      if (!err) {
        dbEnable(projects, props.projectId, getFieldValue("alias"), getFieldValue("connectionString"), defaultDBRules, selectedDB, (err) => {
          if (!err) {
            if (props.redirect) history.push(`/mission-control/projects/${props.projectId}/database/${selectedDB}/overview`)
            props.handleSubmit();
          }
        })
      }
    })
  }

  const alertMsg = <div>
    <b>Note:</b> If your database is running inside a docker container, use the container IP address of that docker container as the host in the connection string.
  </div>

  return (
    <div>
      <Card>
        <p style={{ fontWeight: "bold" }}>Select a database</p>
        <Form.Item>
          {getFieldDecorator("dbType", {
            rules: [{ required: true, message: "Please select a database type!" }],
            initialValue: "mongo"
          })(
            <Radio.Group style={{ width: "100%" }}>
              <Row gutter={16}>
                <Col lg={{ span: 4 }} >
                  <RadioCard value="mongo" layout="db-card" onClick={handleMongo}>
                    <div className="db-card-content" >
                      <img src={mongoIcon} width="24px" height="24px" />
                      <span className="title">MongoDB</span>
                    </div>
                  </RadioCard>
                </Col>
                <Col lg={{ span: 4 }}>
                  <RadioCard value="postgres" layout="db-card" onClick={handlePostgres}>
                    <div className="db-card-content" >
                      <img src={postgresIcon} width="24px" height="24px" />
                      <span className="title">PostgresSQL</span>
                    </div>
                  </RadioCard>
                </Col>
                <Col lg={{ span: 4 }} onClick={handleMysql}>
                  <RadioCard value="mysql" layout="db-card" >
                    <div className="db-card-content">
                      <img src={mysqlIcon} width="24px" height="24px" />
                      <span className="title">MySQL</span>
                    </div>
                  </RadioCard>
                </Col>
                <Col lg={{ span: 4 }} >
                  <RadioCard value="sqlserver" layout="db-card" onClick={handleSqlServer}>
                    <div className="db-card-content">
                      <img src={sqlserverIcon} width="24px" height="24px" />
                      <span className="title">SQL Server</span>
                    </div>
                  </RadioCard>
                </Col>
              </Row>

            </Radio.Group>
          )}
        </Form.Item>
        <Form>
          <p style={{ marginBottom: 0, marginTop: 0, fontWeight: "bold" }}>Provide a connection String</p>
          <label style={{ fontSize: 12 }}>Space Cloud requires a connection string to connect to your database</label>
          <Form.Item >
            {getFieldDecorator('connectionString', {
              rules: [{ required: true, message: 'Please input a connection string' }],
              initialValue: defaultDbConnectionStrings[dbTypes.MONGO]
            })(
              <Input.Password placeholder="eg: mongodb://localhost:27017" />,
            )}
          </Form.Item>
        </Form>
        <Alert message={alertMsg}
          description=" "
          type="info"
          showIcon />
        <Form>
          <p style={{ marginBottom: 0, marginTop: "2%", fontWeight: "bold" }}>Alias</p>
          <label style={{ fontSize: 12 }}>Alias name is used in your frontend queries to identify your database</label>
          <Form.Item>
            {getFieldDecorator('alias', {
              rules: [{
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please input an alias for your database")
                    return
                  }
                  var check = dbAliasNames.some(data => value === data);
                  if (check) {
                    cb("Alias name already taken by another database. Please provide an unique alias name!")
                  }
                  cb()
                }
              }],
              initialValue: alias
            })(
              <Input placeholder="eg: mongo" />,
            )}
          </Form.Item>
        </Form>
        <Button type="primary" className="db-btn" onClick={handleDbSubmit}>Add database</Button>
      </Card><br />
      <center className="skip-link"><Link to={`/mission-control/projects/${props.projectId}/overview`} style={{ color: "rgba(255, 255, 255, 0.6)" }} >Skip for now</Link></center>
    </div>
  );
}

const WrappedCreateDatabase = Form.create({})(CreateDatabase)
export default WrappedCreateDatabase;