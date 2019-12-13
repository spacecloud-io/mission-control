import React, { useState, useEffect } from 'react'
import { useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { set, increment, decrement } from "automate-redux"
import { Link } from 'react-router-dom';
import client from '../../client';
import store from "../../store"
import history from "../../history"
import { generateProjectConfig, notify } from '../../utils';
import CreateDatabase from '../../components/database/create-database/CreateDatabase';

import { Row, Col, Button, Form, Input, Icon, Steps, Card } from 'antd'
import Topbar from '../../components/topbar/Topbar'
import './create-project.css'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState("mongo");
  const [current,setCurrent] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = props.form;
  const { Step } = Steps; 

  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";
  const [projectId, setProjectId] = useState(projectID);

  const handleSubmit = e => {
    //e.preventDefault();
   setProjectId(projectID);
    validateFields((err, values) => {
      if (!err) {
        const projectConfig = generateProjectConfig(projectID, values.projectName, selectedDB)
        dispatch(increment("pendingRequests"))
        client.projects.addProject(projectConfig).then(() => {
          const updatedProjects = [...store.getState().projects, projectConfig]
          dispatch(set("projects", updatedProjects))
          setCurrent(current + 1);
          notify("success", "Success", "Project created successfully with suitable defaults")
        }).catch(ex => notify("error", "Error creating project", ex))
        .finally(() => dispatch(decrement("pendingRequests")))
      }
    });
  };


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
                            <Button type="primary" onClick={handleSubmit} className="project-btn">Create Project</Button>
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
                    <Col lg={{ span: 15, offset: 5 }} sm={{ span: 24 }} >
                        <CreateDatabase projectId={projectId} />
                    </Col>
                </Row>
                <center className="skip-link"><Link to={"/mission-control/projects/" + projectId + "/overview"} >Skip for now</Link></center>
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
