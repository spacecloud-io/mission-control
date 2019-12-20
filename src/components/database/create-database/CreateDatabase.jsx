import React, { useState } from 'react';
import { dbTypes, defaultDbConnectionStrings, defaultDBRules } from '../../../constants';
import { Row, Col, Card, Form, Input, Button} from 'antd';
import StarterTemplate from '../../starter-template/StarterTemplate';
import postgresIcon from '../../../assets/postgresIcon.svg'
import mysqlIcon from '../../../assets/mysqlIcon.svg'
import mongoIcon from '../../../assets/mongoIcon.svg'
import sqlserverIcon from '../../../assets/sqlserverIcon.svg'
import { dbEnable } from '../../../pages/database/dbActions'
import { useHistory } from 'react-router-dom';

const CreateDatabase = (props) => {
  const history = useHistory();
  const [selectedDB, setSelectedDB] = useState(dbTypes.MONGO)
  const [dbConn, setDbConn] = useState(defaultDbConnectionStrings[dbTypes.MONGO]);
  const [alias, setAlias] = useState("mongo");

  const { getFieldDecorator, setFieldsValue, getFieldValue } = props.form;

  
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
    dbEnable(props.projectId, getFieldValue("alias"), getFieldValue("connectionString"), defaultDBRules, selectedDB, (err) => {
      if (!err) props.handleSubmit()
    })
  }


  return (
    <div>
      <Card>
        <b><center style={{fontSize:18, marginBottom:16}}>Add a database to your project</center></b>
        <p>Select a database</p>
        <Row className="db-display db-left">
          <Col span={2}>
            <StarterTemplate icon={mongoIcon} onClick={handleMongo}
              heading="MONGODB" 
              recommended={false}
              active={selectedDB === "mongo"} />
          </Col>
        </Row>
        <Row className="db-display">
          <Col span={2}>
            <StarterTemplate icon={postgresIcon} onClick={handlePostgres}
              heading="POSTGRESQL" 
              recommended={false}
              active={selectedDB === "sql-postgres"} />
          </Col>
        </Row>
        <Row className="db-display">
          <Col span={2}>
            <StarterTemplate icon={mysqlIcon} onClick={handleMysql}
              heading="MYSQL" 
              recommended={false}
              active={selectedDB === "sql-mysql"} />
          </Col>
        </Row>
        <Row className="db-display">
          <Col span={2}>
            <StarterTemplate icon={sqlserverIcon} onClick={handleSqlServer}
              heading="SQL SERVER" 
              recommended={false}
              active={selectedDB === "sql-sqlserver"} />
          </Col>
        </Row>
        <p style={{ marginBottom: 0, marginTop: 0 }}>Provide a connection String</p>
        <label style={{ fontSize: 12 }}>Space Cloud requires a connection string to connect to your database</label>
        <Form>
          <Form.Item >
            {getFieldDecorator('connectionString', {
              rules: [{ required: true, message: 'Please input a connection string' }],
              initialValue: defaultDbConnectionStrings[dbTypes.MONGO]
            })(
              <Input.Password placeholder="eg: mongodb://localhost:27017" />,
            )}
          </Form.Item>
        </Form>
        <p style={{ marginBottom: 0, marginTop: 0 }}>Give your database an alias</p>
        <label style={{ fontSize: 12 }}>Alias is the name that you would use in your frontend to identify your database</label>
        <Form>
          <Form.Item>
            {getFieldDecorator('alias', {
              rules: [{ required: true, message: 'Please input an alias for your database' }],
              initialValue: alias
            })(
              <Input placeholder="eg: mongo" />,
            )}
          </Form.Item>
        </Form>
        <Button type="primary" className="db-btn" onClick={handleDbSubmit}>Add database</Button>
      </Card>
    </div>
  );
}

const WrappedCreateDatabase = Form.create({})(CreateDatabase)
export default WrappedCreateDatabase;