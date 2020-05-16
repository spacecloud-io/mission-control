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
import CreateProjectForm from "../../components/create-project-form/CreateProjectForm";

import { Row, Col, Steps, Card } from 'antd';
import './create-project.css'
import { dbEnable } from '../database/dbActions'

const CreateProject = () => {
  const [selectedDB, setSelectedDB] = useState("mongo");
  const [current, setCurrent] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])

  const { Step } = Steps;
  const [projectId, setProjectId] = useState("");
  const projects = useSelector(state => state.projects)
  const projectIds = projects.map(obj => obj.id)

  const handleSubmit = (projectName, projectId) => {
    setProjectId(projectId);
    const projectConfig = generateProjectConfig(projectId, projectName, selectedDB)

    dispatch(increment("pendingRequests"))
    client.projects.addProject(projectConfig.id, projectConfig).then(() => {
      const updatedProjects = [...store.getState().projects, projectConfig]
      dispatch(set("projects", updatedProjects))
      setCurrent(current + 1);
      notify("success", "Success", "Project created successfully with suitable defaults")
    }).catch(ex => notify("error", "Error creating project", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  };

  const addDatabase = (alias, connectionString, defaultDBRules, selectedDB, dbName) => {
    dbEnable(projects, projectId, alias, connectionString, defaultDBRules, selectedDB, dbName, (err) => {
      if (!err) {
        history.push(`/mission-control/projects/${projectId}`)
      }
    })
  }

  const steps = [{
    title: 'Create Project',
    content: <React.Fragment>
      <Row>
        <Col lg={{ span: 12, offset: 6 }} sm={{ span: 24 }} style={{ marginTop: "3%" }}>
          <Card>
            <CreateProjectForm projects={projectIds} handleSubmit={handleSubmit} />
          </Card>
          <br />
        </Col>
      </Row>
      <center><a onClick={history.goBack} style={{ color: "rgba(255, 255, 255, 0.6)" }}>Cancel</a></center>
    </React.Fragment>
  },
  {
    title: 'Add Database',
    content: <React.Fragment>
      <Row>
        <Col lg={{ span: 18, offset: 3 }} sm={{ span: 24 }} style={{ marginTop: "3%" }}>
          <CreateDatabase projectId={projectId} handleSubmit={addDatabase} />
          <center><Link to={`/mission-control/projects/${projectId}/overview`} style={{ color: "rgba(255, 255, 255, 0.6)" }} >Skip for now</Link></center>
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

export default CreateProject;
