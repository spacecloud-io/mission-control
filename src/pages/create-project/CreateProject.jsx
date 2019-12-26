import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import { set, increment, decrement } from "automate-redux"
import { Link } from 'react-router-dom';
import client from '../../client';
import store from "../../store"
import postgresIcon from '../../assets/postgresIcon.svg'
import { generateProjectConfig, notify, getProjectConfig, generateGalaxyProjectConfig } from '../../utils';
import StarterTemplate from '../../components/starter-template/StarterTemplate'
import {dbTypes} from '../../constants';
import { Row, Col, Button, Form, Input, Icon, Steps, Card, Select, Slider, InputNumber, Checkbox } from 'antd'
import Topbar from '../../components/topbar/Topbar'
import './create-project.css'

const CreateProject = (props) => {
  const [selectedDB, setSelectedDB] = useState(dbTypes.POSTGRESQL);
  const [current,setCurrent] = useState(0);
  const [alias, setAlias] = useState("postgres");
  const [sliderValue, setSliderValue] = useState(25);
  const [check, setCheck] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])


  const { getFieldDecorator, validateFields, getFieldValue, setFieldsValue } = props.form;
  const { Step } = Steps;

  const projectName = getFieldValue("projectName");
  const projectID = projectName ? projectName.toLowerCase().replace(/\s+|-/g, '_') : "";
  const [projectId, setProjectId] = useState(projectID);
  const clusters = getFieldValue("cluster");

  const projects = useSelector(state => state.projects)

  const handleSubmit = e => {
    //e.preventDefault();
    setProjectId(projectID);
    validateFields((err, values) => {
      if (!err) {
        const projectConfig = generateProjectConfig(projectID, values.projectName, selectedDB, clusters)
        const galaxyProjectConfig = generateGalaxyProjectConfig(projectID, clusters, projectConfig)
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
                                  <p>Select the cluster for this project</p>
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
                    <Card>
                    <center>Add a managed database to your project</center>
                    <p>Select a database</p>
                    <Row className="db-display">
                      <Col span={2}>
                        <StarterTemplate icon={postgresIcon} onClick={handlePostgres}
                          heading="POSTGRESQL" 
                          recommended={false}
                          active={selectedDB === "sql-postgres"} />
                      </Col>
                    </Row>
                    <p>Version</p>
                    <Form.Item>
                      {getFieldDecorator('version', {
                          rules: [{ required: true, message: 'Please select a version' }],
                          initialValue: "1"
                          })(
                          <Select placeholder="Select a version" style={{width: "32%"}}>
                            <Select.Option value="1">YB - 2.0.8 (Postgres - 11.2)</Select.Option>
                          </Select>
                      )}
                    </Form.Item>
                    <p>Instance Type</p>
                    <Form.Item>
                      {getFieldDecorator('instance_type', {
                          rules: [{ required: true, message: 'Please select instance type for the project' }],
                          initialValue: "1"
                          })(
                          <Select placeholder="Select instance type" style={{width: "32%"}}>
                            <Select.Option value="1">1 vCPU / 2GB RAM</Select.Option>
                            <Select.Option value="2">2 vCPU / 4GB RAM</Select.Option>
                            <Select.Option value="3">4 vCPU / 8GB RAM</Select.Option>
                            <Select.Option value="4">6 vCPU / 16GB RAM</Select.Option>
                          </Select>
                      )}
                    </Form.Item>
                    <p>Storage</p>
                    <Form.Item>
                    <Slider
                      min={25}
                      max={16384}
                      tipFormatter={(value) => `${value} GB`}
                      defaultValue={25}
                      style={{width: "32%", float:"left"}}
                      onChange={(value) => setSliderValue(value)}
                      value={typeof sliderValue === 'number' ? sliderValue : 25}
                    />
                    <InputNumber
                      min={25}
                      max={16384}
                      formatter={value => `${value} GB`}
                      style={{ marginLeft: "2%", width: "15%" }}
                      value={sliderValue}
                      onChange={(value) => setSliderValue(value)}
                    />
                    </Form.Item>
                    <Form.Item>
                    <Checkbox checked={check} onChange={e => setCheck(e.target.checked)}>Add Space Cloud to your project</Checkbox>
                    </Form.Item>
                    {check && (
                      <div>
                      <p style={{ marginBottom: 0, marginTop: 0 }}>Give your database an alias for Space Cloud</p>
                      <label style={{ fontSize: 12 }}>Alias is the name that you would use in your frontend to identify your database</label>
                      <Form.Item>
                        {getFieldDecorator('alias', {
                          rules: [{ required: true, message: 'Please input an alias for your database' }],
                          initialValue: alias
                        })(
                          <Input placeholder="eg: postgres" style={{width: "32%" }} />,
                        )}
                      </Form.Item>
                      </div>
                    )}
                    <p>Replication Factor</p>
                    <Form.Item>
                      {getFieldDecorator('replication_factor', {
                          rules: [{ required: true, message: 'Please select replication factor for the project' }],
                          initialValue: "1"
                          })(
                          <Select placeholder="Select replication factor" style={{width: "32%"}}>
                            <Select.Option value="1">1</Select.Option>
                            <Select.Option value="3">3</Select.Option>
                            <Select.Option value="5">5</Select.Option>
                          </Select>
                      )}
                    </Form.Item>
                    <p style={{ marginBottom: 0, marginTop: 0 }}>Instances</p>
                    <label style={{ fontSize: 12 }}>Number of instances should always be more than that of replicas</label>
                    <Form.Item>
                      {getFieldDecorator('instances', {
                          rules: [{ required: true, message: 'Please input an instances' }],
                          initialValue: "1"
                        })(
                          <InputNumber style={{width: "32%"}} />,
                      )}
                    </Form.Item>
                    <p>Cluster</p>
                    <Form.Item>
                      {getFieldDecorator('cluster', {
                          rules: [{ required: true, message: 'Please select cluster for the project' }],
                          initialValue: "cluster_1"
                          })(
                          <Select placeholder="Select cluster" mode="multiple" style={{width: "32%"}}>
                            <Select.Option value="cluster_1">Cluster 1</Select.Option>
                            <Select.Option value="cluster_2">Cluster 2</Select.Option>
                            <Select.Option value="cluster_3">Cluster 3</Select.Option>
                          </Select>
                      )}
                    </Form.Item>
                    <Form.Item>
                      <Checkbox>Auto scale storage</Checkbox><br />
                      <Checkbox>Automatic backup</Checkbox>
                    </Form.Item>
                    <Button type="primary" className="db-btn">Add database</Button>
                    </Card>
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
