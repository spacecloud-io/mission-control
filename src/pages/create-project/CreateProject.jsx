import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { set, increment, decrement } from "automate-redux"
import { Link } from 'react-router-dom';
import client from '../../client';
import store from "../../store"
import postgresIcon from '../../assets/postgresIcon.svg'
import yb from '../../assets/yb.svg'
import { generateProjectConfig, notify, getProjectConfig, generateGalaxyProjectConfig } from '../../utils';
import StarterTemplate from '../../components/starter-template/StarterTemplate'
import { dbTypes } from '../../constants';
import { Row, Col, Button, Form, Input, Icon, Steps, Card, Select, Slider, InputNumber, Checkbox } from 'antd'
import Topbar from '../../components/topbar/Topbar'
import './create-project.css'
import Database from '../../components/ManageServices/Database'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState(dbTypes.POSTGRESQL);
  const [current, setCurrent] = useState(0);
  const [alias, setAlias] = useState("postgres");
  const [sliderValue, setSliderValue] = useState(25);
  const [check, setCheck] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = props.form;
  const { Step } = Steps;
  const { Option } = Select;
  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";
  const [projectId, setProjectId] = useState(projectID);
  const clusters = getFieldValue("cluster");
  const defaultEnv = getFieldValue("defaultEnv");

  const handleSubmit = e => {
    //e.preventDefault();
    setProjectId(projectID);
    validateFields((err, values) => {
      if (!err) {
        const projectConfig = generateProjectConfig(projectID, values.projectName, selectedDB)
        const galaxyProjectConfig = generateGalaxyProjectConfig(projectID, defaultEnv, clusters, projectConfig)
        dispatch(increment("pendingRequests"))
        client.projects.addProject(galaxyProjectConfig).then(() => {
          const updatedProjects = [...store.getState().projects, galaxyProjectConfig]
          dispatch(set("projects", updatedProjects))
          setCurrent(current + 1);
          notify("success", "Success", "Project created successfully with suitable defaults")
        }).catch(ex => notify("error", "Error creating project", ex))
          .finally(() => dispatch(decrement("pendingRequests")))
      }
    });
  };

  const handlePostgres = () => {
    setSelectedDB(dbTypes.POSTGRESQL);
    setFieldsValue({
      alias: "postgres"
    });
  }
  const steps = [{
    title: 'Create Project',
    content: <div>
      <Row>
        <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} >
          <Card>
            <center>Create Project</center>
            <div className="label-spacing">
              <p style={{ marginBottom: 0, marginTop: 0 }}>Project name</p>
              <Form>
                <Form.Item >
                  {getFieldDecorator('projectName', {
                    rules: [{ required: true, message: 'Please input a project name' }],
                  })(
                    <Input
                      prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder="Project name" />,
                  )}
                  <br />
                  {projectID && <span className="hint">ProjectID: {projectID}</span>}
                </Form.Item>
                <p style={{ marginBottom: 0, marginTop: 0 }}>Name your default environment</p>
                <label style={{ fontSize: 12 }}>You can add other environments later like staging,testig,etc</label>
                <Form.Item >
                  {getFieldDecorator('defaultEnv', {
                    rules: [{ required: true, message: 'Please input a default environment' }],
                  })(
                    <Input placeholder="Example: Testing" />,
                  )}
                </Form.Item>
                <p style={{ marginBottom: 0, marginTop: 0 }}>Select the clusters for this environment</p>
                <Form.Item>
                  {getFieldDecorator('cluster', {
                    rules: [{ required: true, message: 'Please select cluster for the project' }],
                  })(
                    <Select placeholder="Select cluster" mode="multiple">
                      <Select.Option value="cluster_1">Cluster 1</Select.Option>
                      <Select.Option value="cluster_2">Cluster 2</Select.Option>
                      <Select.Option value="cluster_3">Cluster 3</Select.Option>
                    </Select>
                  )}
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
          <Database />
          <Button type="primary" className="db-btn">Add database</Button>
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
