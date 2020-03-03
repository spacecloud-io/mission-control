import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { set, increment, decrement } from "automate-redux"
import { Link } from 'react-router-dom';
import client from '../../client';
import store from "../../store"
import history from "../../history"
import { generateProjectConfig, notify } from '../../utils';
import CreateDatabase from '../../components/database/create-database/CreateDatabase';
import createProject from '../../assets/createProject.svg';
import createDatabase from '../../assets/createDatabase.svg';
import { Row, Col, Button, Form, Input, Icon, Steps, Card, Select, Alert } from 'antd'
import Topbar from '../../components/topbar/Topbar';
import './create-project.css'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState("mongo");
  const [current, setCurrent] = useState(0);
  const [stepImg, setStepImg] = useState("create project");
  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = props.form;
  const { Step } = Steps;

  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";
  const [projectId, setProjectId] = useState(projectID);

  const projects = useSelector(state => state.projects)

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

  const alertMsg = <div>
    <span style={{fontWeight:"bold"}}>Help:</span> Can’t find your cluster above?</div>

  const alertDes = <div>Don’t worry you can <Link>add an existing cluster</Link> to your 
    project or <Link>create a new one from scratch</Link>.</div>

  const steps = [{
    title: 'Create Project',
    content: <div>
      <Row>
        <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }} md={{ span: 12 }} style={{marginTop:"3%"}}>
          <Card>
              <Form>
                <p style={{ fontWeight:"bold" }}><b>Name your project</b></p>
                <Form.Item >
                  {getFieldDecorator('projectName', {
                    rules: [
                      {
                        validator: (_, value, cb) => {
                          if (!value) {
                            cb("Please input a project name")
                            return
                          }
                          if (value.includes("-") || value.includes(" ") || value.includes("_")) {
                            cb("Project name cannot contain hiphens, spaces or underscores!")
                          }
                          cb()
                        }
                      }],
                  })(
                    <Input
                      prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder="Project name" />,
                  )}
                  <br />
                  {projectID && <span className="hint">ProjectID: {projectID}</span>}
                </Form.Item>
                <p style={{ marginBottom:0, fontWeight:"bold" }}>Clusters</p>
                <label style={{marginTop:0, fontSize:"12px"}}>Each project requires atleast one Space Cloud cluster to run</label>
                <Form.Item>
                  {getFieldDecorator('cluster', {
                    rules: [{ required: true, message: "Please select cluster" }]
                  })( 
                    <Select mode="multiple" placeholder="Select clusters">
                      <Select.Option value="1">cluster 1</Select.Option>
                      <Select.Option value="2">cluster 2</Select.Option>
                      <Select.Option value="3">cluster 3</Select.Option>
                    </Select>
                  )}
                </Form.Item>
                <Alert  message={alertMsg}
                  description={alertDes}
                  type="info"
                  showIcon/>
              </Form>
            <Button type="primary" onClick={handleSubmit} className="project-btn">Create project</Button>
          </Card><br />
        </Col>
      </Row>
      <center><Link to="/mission-control/welcome" style={{color:"rgba(255, 255, 255, 0.6)"}}>Cancel</Link></center>
    </div>
  },
  {
    title: 'Add Database',
    content: <div>
      <Row>
        <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} style={{marginTop:"3%"}}>
          <CreateDatabase projectId={projectId} handleSubmit={() => history.push(`/mission-control/projects/${projectId}`)} />
        </Col>
      </Row>
    </div>
  }];

  return (
    <div className="create-project">
      <Row>
        <Col lg={{ span: 4 }} style={{ textAlign:"center", position:"fixed", top:"40%" }}>
          {current === 0 && <img src={createProject} width="80%" />}
          {current === 1 && <img src={createDatabase} width="80%" />}
        </Col>
        <Col lg={{ span:20 }}>
          <div className="content">
            <Row>
              <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} >
                <Steps current={current} className="step-display" size="small">
                  {steps.map(item => (
                    <Step key={item.title} title={item.title} />
                  ))}
                </Steps><br />
              </Col>
            </Row>
            <div>{steps[current].content}</div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
const WrappedCreateProject = Form.create({})(CreateProject)

export default WrappedCreateProject;
