import React, { useEffect, useState } from 'react';
import Sidenav from '../../../components/sidenav/Sidenav';
import Topbar from '../../../components/topbar/Topbar';
import { useParams, useHistory } from 'react-router-dom';
import { LeftOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Row, Col, Button, Form, Input, Card } from 'antd';
import ReactGA from 'react-ga'
import { useSelector } from 'react-redux';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../../components/form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import '../database.css';

const AddPreparedQueries = (props) => {
    const { projectID, selectedDB } = useParams()
    const history = useHistory()
    const projects = useSelector(state => state.projects)
    const [form] = Form.useForm()
    const [preparedQueries, setPreparedQueries] = useState("select * from all")

    useEffect(() => {
        ReactGA.pageview("/projects/database/prepared-queries/add-prepared-queries");
    }, [])

    const handleSubmit = e => {
        form.validateFields().then(formValues => {
          const values = {
            id: formValues.id,
            type: formValues.type
          };
          
    
          props.handleSubmit(values).then(() => {
            props.handleCancel();
            form.resetFields();
          })
        });
      };

    return (
        <React.Fragment>
            <Topbar
                showProjectSelector
            />
            <div>
                <Sidenav selectedItem='database' />
                <div className='page-content page-content--no-padding'>
                    <div style={{
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                        height: 48,
                        lineHeight: 48,
                        zIndex: 98,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 16px"
                    }}>
                        <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/database/${selectedDB}/prepared-queries`)}>
                            <LeftOutlined />
                            Go back
                            </Button>
                        <span style={{ marginLeft: "35%" }}>
                            Add prepared queries
                            </span>
                    </div><br />
                    <div>
                        <Row>
                            <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }} >
                                <Card style={{ padding:"24px" }}>
                                <Form form={form} onFinish={handleSubmit}>
                                    <p style={{ fontSize:"16px", marginBottom:0 }}><b>Name your prepared query </b></p>
                                    <p style={{ fontSize:"14px", marginTop:0 }}>Used to identify the prepared query in the GraphQL API</p>
                                    <Form.Item name="name" rules={[{ required: true, message: "Please input a name!" }]}>
                                        <Input placeholder="e.g. my_prepared_statement1"/>
                                    </Form.Item>
                                    <FormItemLabel name="SQL Query" />
                                    <CodeMirror
                                        value={preparedQueries}
                                        options={{
                                        mode: { name: "sql", json: true },
                                        lineNumbers: true,
                                        styleActiveLine: true,
                                        matchBrackets: true,
                                        autoCloseBrackets: true,
                                        tabSize: 2,
                                        autofocus: true
                                        }}
                                        onBeforeChange={(editor, data, value) => {
                                            setPreparedQueries(value)
                                        }}
                                    /><br />
                                    <p style={{ fontSize:"16px", marginBottom:0 }}><b>Arguments</b> (Optional)</p>
                                    <p style={{ fontSize:"14px", marginTop:0 }}>Add the arguments from the GraphQL API that you want to access in the SQL query</p>
                                    <Form.List name="arguments" rules={[{ required: true, message: "Please input a name!" }]}>
                                    {(fields, { add, remove }) => {
                                        return (
                                            <div>
                                            {fields.map((field, index) => (
                                                <React.Fragment>
                                                <Row key={field}>
                                                    <Col span={10}>
                                                    <Form.Item name={[field.name, "argument-name"]} validateTrigger={["onChange", "onBlur"]}
                                                        rules={[{ required: true, message: "Please input " }]}>
                                                        <Input
                                                        style={{ width: "90%", marginRight: "6%", float: "left" }}
                                                        placeholder="eg. args.foo"
                                                        />
                                                    </Form.Item>
                                                    </Col>
                                                    <Col span={3}>
                                                    <Button
                                                    onClick={() => remove(field.name)}
                                                    style={{ marginRight: "2%", float: "left" }}>
                                                    <DeleteOutlined />
                                                    </Button>
                                                    </Col>
                                                </Row>
                                                </React.Fragment>
                                            ))}
                                            <Form.Item>
                                                <Button
                                                onClick={() => {
                                                    const fieldKeys = [
                                                    ...fields.map(obj => ["arguments", obj.key, "argument-name"]),
                                                    ]
                                                    form.validateFields(fieldKeys)
                                                    .then(() => add())
                                                    .catch(ex => console.log("Exception", ex))
                                                }}
                                                style={{ marginRight: "2%", float: "left" }}
                                                >
                                                <PlusOutlined /> Add another pair
                                                    </Button>
                                            </Form.Item>
                                            </div>
                                        );
                                        }}
                                    </Form.List>
                                    <Button type="primary" style={{ width: "100%" }} onClick={handleSubmit}>Add prepared query</Button>
                                </Form>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default AddPreparedQueries;
