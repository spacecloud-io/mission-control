import React, { useState } from 'react';
import { dbTypes, defaultDbConnectionStrings } from '../../../constants';
import { Row, Col, Card, Form, Input, Button} from 'antd';
import StarterTemplate from '../../starter-template/StarterTemplate';
import postgresIcon from '../../../assets/postgresIcon.svg'
import mysqlIcon from '../../../assets/mysqlIcon.svg'
import mongoIcon from '../../../assets/mongoIcon.svg'

const CreateDatabase = (props) => {
    const [selectedDB, setSelectedDB] = useState("mongo")

    const { getFieldDecorator, setFieldsValue } = props.form;

    const handleMongo = () => {
        setSelectedDB(dbTypes.MONGO);
        setFieldsValue({connectionString: defaultDbConnectionStrings[dbTypes.MONGO], alias: "mongo"});
    }

    const handlePostgres = () => {
        setSelectedDB(dbTypes.POSTGRESQL);
        setFieldsValue({connectionString: defaultDbConnectionStrings[dbTypes.POSTGRESQL], 
            alias: "postgres"});
    }

    const handleMysql = () => {
        setSelectedDB(dbTypes.MYSQL);
        setFieldsValue({connectionString: defaultDbConnectionStrings[dbTypes.MYSQL], alias: "mysql"});
    }

    
    return(
        <div>
                    <Card>
                            <center>Add a database to your project</center>
                            <p className="db-left">Select a database</p>
                            <Row className="db-display db-left">
                            <Col span={3}>
                            <StarterTemplate icon={mongoIcon} onClick={handleMongo}
                                heading="MONGODB" desc="A open-source cross-platform document- oriented database."
                                recommended={false}
                                active={selectedDB === "mongo"} />
                            </Col>
                            </Row>
                            <Row className="db-display">
                            <Col span={3}>
                            <StarterTemplate icon={postgresIcon} onClick={handlePostgres} 
                                heading="POSTGRESQL" desc="The world's most advanced open source database."
                                recommended={false}
                                active={selectedDB === "sql-postgres"} />
                            </Col>
                            </Row>
                            <Row className="db-display">
                            <Col span={3}>
                            <StarterTemplate icon={mysqlIcon} onClick={handleMysql}
                                heading="MYSQL" desc="The world's most popular open source database."
                                recommended={false}
                                active={selectedDB === "sql-mysql"} />
                            </Col>
                            </Row>
                            <p style={{marginBottom:0, marginTop:0}}>Provide a connection String</p>
                            <label style={{fontSize: 12}}>Space Cloud requires a connection string to connect to your database</label>
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
                            <p style={{marginBottom:0, marginTop:0}}>Give your database an alias</p>
                            <label style={{fontSize: 12}}>Alias is the name that you would use in your frontend to identify your database</label>
                            <Form>
                                <Form.Item>
                                    {getFieldDecorator('alias', {
                                    rules: [{ required: true, message: 'Please input an alias for your database' }],
                                    initialValue: "mongo"
                                    })(
                                    <Input placeholder="eg: mongo" />,
                                    )}
                                </Form.Item>
                            </Form>
                            <Button type="primary" className="db-btn">Add database</Button>
                        </Card>
            </div>
    );
}

const WrappedCreateDatabase = Form.create({})(CreateDatabase)
export default WrappedCreateDatabase;