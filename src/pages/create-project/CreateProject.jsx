import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom';
import history from "../../history"
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import CreateDatabase from '../../components/database/create-database/CreateDatabase';
import CreateProjectForm from "../../components/create-project-form/CreateProjectForm";

import { Row, Col, Steps, Card } from 'antd';
import './create-project.css'
import { addDatabase } from "../../operations/database"
import { addProject } from '../../operations/projects';
import { actionQueuedMessage } from '../../constants';

const CreateProject = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    ReactGA.pageview("/create-project");
  }, [])

  const { Step } = Steps;
  const [projectId, setProjectId] = useState("");
  const projects = useSelector(state => state.projects)
  const projectIds = projects.map(obj => obj.id)

  const handleSubmit = (projectName, projectId) => {
    setProjectId(projectId);

    incrementPendingRequests()
    addProject(projectId, projectName)
      .then(({ queued }) => {
        if (!queued) {
          setCurrent(current + 1);
        }
        notify("success", "Success", queued ? actionQueuedMessage : "Project created successfully with suitable defaults")
      }).catch(ex => notify("error", "Error creating project", ex))
      .finally(() => decrementPendingRequests())
  };

  const handleAddDatabase = (alias, connectionString, dbType, dbName) => {
    incrementPendingRequests()
    addDatabase(projectId, alias, dbType, dbName, connectionString)
      .then(({ queued }) => {
        if (!queued) {
          history.push(`/mission-control/projects/${projectId}`)
          notify("success", "Success", "Successfully added database")
          notify("info", "Enabled eventing module", "Configured this database to store event logs. Check out the settings in eventing section to change it")
        } else {
          notify("success", "Success", actionQueuedMessage)
        }
      })
      .catch(ex => notify("error", "Error adding database", ex))
      .finally(() => decrementPendingRequests())
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
          <CreateDatabase projectId={projectId} handleSubmit={handleAddDatabase} />
          <center style={{ marginTop: 16 }}><Link to={`/mission-control/projects/${projectId}/overview`} style={{ color: "rgba(255, 255, 255, 0.6)" }} >Skip for now</Link></center>
        </Col>
      </Row>
    </React.Fragment>
  }];

  return (
    <div className="create-project">
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
  )
}

export default CreateProject;
