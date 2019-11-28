import React, { useState, useEffect } from 'react'
import { useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { set, increment, decrement } from "automate-redux"
import { Link } from 'react-router-dom';
import client from '../../client';
import store from "../../store"
import history from "../../history"
import { generateProjectConfig, notify } from '../../utils';

import { Row, Col, Button, Form, Input, Icon, Steps, Card } from 'antd'
import StarterTemplate from '../../components/starter-template/StarterTemplate'
import Topbar from '../../components/topbar/Topbar'
import './create-project.css'

import create from '../../assets/create.svg'
import postgresIcon from '../../assets/postgresIcon.svg'
import mysqlIcon from '../../assets/mysqlIcon.svg'
import mongoIcon from '../../assets/mongoIcon.svg'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState("mongo");
  const [current,setCurrent] = useState(0);
  const [dbValue, setDbValue] = useState("mongodb://localhost:27017");
  const [alias, setAlias] = useState("mongo");
  const dispatch = useDispatch()

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue } = props.form;
  const { Step } = Steps; 

  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";

  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, values) => {
      if (!err) {
        const projectConfig = generateProjectConfig(projectID, values.projectName, selectedDB)
        dispatch(increment("pendingRequests"))
        client.projects.addProject(projectConfig).then(() => {
          const updatedProjects = [...store.getState().projects, projectConfig]
          dispatch(set("projects", updatedProjects))
          history.push(`/mission-control/projects/${projectID}`)
          notify("success", "Success", "Project created successfully with suitable defaults")
        }).catch(ex => notify("error", "Error creating project", ex))
        .finally(() => dispatch(decrement("pendingRequests")))
      }
    });
  };

  const stepchange = () => {
        const newCurrent = current + 1;
        setCurrent(newCurrent);
    }

    const handleMongo = () => {
        setSelectedDB("mongo");
        setDbValue("mongodb://localhost:27017");
        setAlias("mongo");
    }

    const handlePostgres = () => {
        setSelectedDB("sql-postgres");
        setDbValue("postgres://postgres:mysecretpassword@localhost:5432/postgres?sslmode=disable");
        setAlias("postgres");
    }

    const handleMysql = () => {
        setSelectedDB("sql-mysql");
        setDbValue("root:my-secret-pw@tcp(localhost:3306)/");
        setAlias("mysql");
    }

  const steps = [{
    title: 'Create Project',
    content: <div>
                <Row>
                    <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} >
                        <Card>
                            <center>Create Project</center>
                            <div className="label-spacing">
                            <p>Project name</p>
                            <Form>
                                <Form.Item >
                                    {getFieldDecorator('projectName', {
                                    rules: [{ required: true, message: 'Please input a project name' }],
                                    })(
                                    <Input
                                        prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                        placeholder="Project name" />,
                                    )}
                                    <br/>
                                    {projectID && <span className="hint">ProjectID: {projectID}</span>}
                                </Form.Item>
                            </Form>
                            </div>
                            <Button type="primary" onClick={stepchange} className="project-btn">Create Project</Button>
                        </Card><br />
                    </Col>
                </Row>
                <center><Link to="/mission-control/welcome">Cancel</Link></center>
            </div>
},
{
    title: 'Add Database',
    content: <div>
                <Row>
                    <Col lg={{ span: 13, offset: 6 }} sm={{ span: 24 }} >
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
                                    initialValue: dbValue
                                    })(
                                    <Input placeholder="eg: mongodb://localhost:27017" />,
                                    )}
                                </Form.Item>
                            </Form>
                            <p style={{marginBottom:0, marginTop:0}}>Give your database an alias</p>
                            <label style={{fontSize: 12}}>Alias is the name that you would use in your frontend to identify your database</label>
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
                            <Link to={"/mission-control/projects/" + projectID + "/overview"} ><Button type="primary" className="db-btn">Add database</Button></Link>
                        </Card>
                    </Col>
                </Row>
                <center><Link to={"/mission-control/projects/" + projectID + "/overview"} >Skip for now</Link></center>
            </div>
}];

  return (
    <div className="create-project">
      <Topbar hideActions />
      <div className="content">
        <Row>
            <Col lg={{ span: 8, offset: 8 }} sm={{ span: 24 }} >
                <Steps current={current} className="step-display" size="small">
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} /> 
                    ))}
                </Steps><br />
            </Col>
        </Row>
        <div>{steps[current].content}</div>     
      </div>
    </div>
  )
}
const WrappedCreateProject = Form.create({})(CreateProject)

export default WrappedCreateProject;
