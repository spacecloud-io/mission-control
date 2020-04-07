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
import { Row, Col, Button, Form, Input, Icon, Steps, Card, Select, Alert } from 'antd'
import './create-project.css'
import { dbEnable } from '../database/dbActions'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState("mongo");
  const [current, setCurrent] = useState(0);
  const [stepImg, setStepImg] = useState("create project");
  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue } = props.form;
  const { Step } = Steps;

  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase(): "";
  const [projectId, setProjectId] = useState(projectID);
  const enterpriseMode = localStorage.getItem('enterprise') === 'true'
  const projects = useSelector(state => state.projects)
  const clusters = useSelector(state => state.clusters)

  const handleSubmit = e => {
    //e.preventDefault();
    setProjectId(projectID);
    validateFields((err, values) => {
      if (!err) {
        const projectConfig = generateProjectConfig(projectID, values.projectName, selectedDB)

        dispatch(increment("pendingRequests"))
        client.projects.addProject(projectConfig.id, projectConfig).then(() => {
          const updatedProjects = [...store.getState().projects, projectConfig]
          dispatch(set("projects", updatedProjects))
          setCurrent(current + 1);
          notify("success", "Success", "Project created successfully with suitable defaults")
          const projectClusters = values.cluster
          if (enterpriseMode) {
            Promise.all(...projectClusters.map(c => client.clusters.addCluster(projectConfig.id, c))).then(() => {
              const updatedClusters = store.getState().clusters.map(cluster => projectClusters.some(c => c === cluster.id) ? Object.assign({}, cluster, { projects: [...cluster.projects, projectConfig.id] }) : cluster)
              dispatch(set("clusters", updatedClusters))
            })
              .catch(ex => notify("error", "Error adding clusters to project", ex))
          }
        }).catch(ex => notify("error", "Error creating project", ex))
          .finally(() => dispatch(decrement("pendingRequests")))
      }
    });
  };

  const addDatabase = (alias, connectionString, defaultDBRules, selectedDB) => {
    dbEnable(projects, projectId, alias, connectionString, defaultDBRules, selectedDB, (err) => {
      if (!err) {
        history.push(`/mission-control/projects/${projectId}`)
      }
    })
  }

  const alertMsg = <div>
    <span style={{ fontWeight: "bold" }}>Help:</span> Can’t find your cluster above?</div>

  const alertDes = <div>Don’t worry you can <Link>add an existing cluster</Link> to your
    project or <Link>create a new one from scratch</Link>.</div>

  const steps = [{
    title: 'Create Project',
    content: <React.Fragment>
      <Row>
        <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} style={{ marginTop: "3%" }}>
          <Card>
            <Form>
              <p style={{ fontWeight: "bold" }}><b>Name your project</b></p>
              <Form.Item >
                {getFieldDecorator('projectName', {
                  rules: [
                    {
                      validator: (_, value, cb) => {
                        if (!value) {
                          cb("Please input a project name")
                          return
                        }
                        if (!(/^[0-9a-zA-Z]+$/.test(value))) {
                          cb("Project name can only contain alphanumeric characters!")
                          return
                        }
                        if (projects.some(p => p.id === value.toLowerCase())) {
                          cb("Project name already taken. Please provide a unique project name!")
                          return
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
              {enterpriseMode && <div> <p style={{ marginBottom: 0, fontWeight: "bold" }}>Clusters</p>
                <label style={{ marginTop: 0, fontSize: "12px" }}>Each project requires atleast one Space Cloud cluster to run</label>
                <Form.Item>
                  {getFieldDecorator('cluster', {
                    rules: [{ required: true, message: "Please select cluster" }]
                  })(
                    <Select mode="multiple" placeholder="Select clusters">
                      {clusters.map(data => {
                        return <Select.Option value={data.id}>{data.id}</Select.Option>
                      })}
                    </Select>
                  )}
                </Form.Item>
                <Alert message={alertMsg}
                  description={alertDes}
                  type="info"
                  showIcon />
              </div>}
            </Form>
            <Button type="primary" onClick={handleSubmit} className="project-btn">Create project</Button>
          </Card><br />
        </Col>
      </Row>
      <center><Link to="/mission-control/welcome" style={{ color: "rgba(255, 255, 255, 0.6)" }}>Cancel</Link></center>
    </React.Fragment>
  },
  {
    title: 'Add Database',
    content: <React.Fragment>
      <Row>
        <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} style={{ marginTop: "3%" }}>
          <CreateDatabase projectId={projectId} handleSubmit={addDatabase} />
        </Col>
      </Row>
    </React.Fragment>
  }];

  return (
    <div className="create-project">
      <div className="create-project--content">
        <Row>
          <Col lg={{ span: 8, offset: 8 }} sm={{ span: 24 }} >
            <Steps current={current} className="step-display" size="small">
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps><br />
          </Col>
        </Row>
        {steps[current].content}
      </div>
    </div>
  )
}
const WrappedCreateProject = Form.create({})(CreateProject)

export default WrappedCreateProject;
