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
import { getProjectConfig, notify } from '../../../utils';
import { defaultPreparedQueryRule } from '../../../constants';
import { setPreparedQueries } from '../dbActions';

const AddPreparedQueries = () => {
  const { projectID, selectedDB, preparedQueryId } = useParams()
  const history = useHistory()
  const projects = useSelector(state => state.projects)
  const collections = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.collections`, {});
  const preparedQueries = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.preparedQueries`, {})
  const preparedQuery = getProjectConfig(projects, projectID, `modules.db.${selectedDB}.preparedQueries.${preparedQueryId}`, { id: "", args: [] });
  const collectionNames = Object.keys(collections)
  const preparedQueryNames = Object.keys(preparedQueries)
  const [form] = Form.useForm()
  const [sqlQuery, setSqlQuery] = useState(preparedQueryId ? preparedQuery.sql : "")

  // This is used to bind the form initial values on page reload. 
  // On page reload the redux is intially empty leading the form initial values to be empty. 
  // Hence as soon as redux gets the desired value, we set the form values    
  useEffect(() => {
    if (preparedQuery.id) {
      form.setFieldsValue(preparedQuery)
      setSqlQuery(preparedQuery.sql)
    }
  }, [preparedQuery])

  useEffect(() => {
    ReactGA.pageview(`/projects/database/prepared-queries/${preparedQueryId ? "edit" : "add"}`);
  }, [])


  const handleSubmit = formValues => {
    setPreparedQueries(projectID, selectedDB, formValues.id, formValues.args, sqlQuery, defaultPreparedQueryRule)
      .then(() => {
        history.goBack();
        notify("success", "Success", `Sucessfully ${preparedQueryId ? "edited" : "added"} prepared query`)
      })
      .catch(ex => notify("error", `Error ${preparedQueryId ? "editing" : "adding"} prepared query`, ex))
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
              <LeftOutlined /> Go back
            </Button>
            {!preparedQueryId && <span style={{ marginLeft: "35%" }}>
              Add prepared queries
              </span>}
            {preparedQueryId && <span style={{ marginLeft: "35%" }}>
              Edit prepared queries
            </span>}
          </div><br />
          <div>
            <Row>
              <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }} >
                <Card style={{ padding: "24px" }}>
                  <Form form={form} onFinish={handleSubmit} initialValues={{ id: preparedQuery.id, args: preparedQuery.args }}>
                    <p style={{ fontSize: "16px", marginBottom: 0 }}><b>Name your prepared query </b></p>
                    <p style={{ fontSize: "14px", marginTop: 0 }}>Used to identify the prepared query in the GraphQL API</p>
                    <Form.Item name="id" rules={[{
                      validator: (_, value, cb) => {
                        if (!value) {
                          cb("Please input a name")
                          return
                        }
                        if (!(/^[0-9a-zA-Z_]+$/.test(value))) {
                          cb(`Prepared query name can only contain alphanumeric characters and underscores!`)
                          return
                        }
                        if (!preparedQueryId) {
                          if (collectionNames.some(name => name.toLowerCase() === value.toLowerCase())) {
                            cb("This name collides with an existing collection/table name. Please provide an unique name!")
                            return
                          }
                          if (preparedQueryNames.some(name => name.toLowerCase() === value.toLowerCase())) {
                            cb("This name collides with an existing prepared query name. Please provide an unique name!")
                            return
                          }
                        }
                        cb()
                      }
                    }]}>
                      <Input disabled={preparedQueryId} placeholder="e.g. my_prepared_statement1" />
                    </Form.Item>
                    <FormItemLabel name="SQL Query" />
                    <CodeMirror
                      value={sqlQuery}
                      options={{
                        mode: { name: "sql" },
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                        tabSize: 2,
                        autofocus: true
                      }}
                      onBeforeChange={(editor, data, value) => {
                        setSqlQuery(value)
                      }}
                    /><br />
                    <p style={{ fontSize: "16px", marginBottom: 0 }}><b>Arguments</b> (Optional)</p>
                    <p style={{ fontSize: "14px", marginTop: 0 }}>Add the arguments from the GraphQL API that you want to access in the SQL query</p>
                    <Form.List name="args">
                      {(fields, { add, remove }) => {
                        return (
                          <div>
                            {fields.map((field, index) => (
                              <React.Fragment>
                                <Row key={field}>
                                  <Col span={10}>
                                    <Form.Item name={[field.name]} validateTrigger={["onChange", "onBlur"]}
                                      rules={[{ required: true, message: "Please input argument" }]}>
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
                                    ...fields.map(obj => ["args", obj.name]),
                                  ]
                                  form.validateFields(fieldKeys)
                                    .then(() => add())
                                    .catch(ex => console.log("Exception", ex))
                                }}
                                style={{ marginRight: "2%", float: "left" }}
                              >
                                <PlusOutlined /> Add argument</Button>
                            </Form.Item>
                          </div>
                        );
                      }}
                    </Form.List>
                    <Button type="primary" htmlType="submit" block>{preparedQueryId ? "Save" : "Add prepared query"}</Button>
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
