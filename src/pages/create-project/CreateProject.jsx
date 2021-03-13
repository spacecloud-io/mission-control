import React, { useState } from 'react'
import { useSelector } from "react-redux";
import { notify, incrementPendingRequests, decrementPendingRequests, openProject } from '../../utils';
import CreateDatabase from '../../components/database/create-database/CreateDatabase';
import CreateProjectForm from "../../components/create-project-form/CreateProjectForm";

import { Card, Tabs } from 'antd';
import './create-project.css'
import { addDatabase } from "../../operations/database"
import { addProject } from '../../operations/projects';
import { actionQueuedMessage } from '../../constants';
import Topbar from '../../components/topbar/Topbar';
import { AppleOutlined, DatabaseOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const CreateProject = () => {
  const [current, setCurrent] = useState("1");

  const [projectId, setProjectId] = useState("");
  const projects = useSelector(state => state.projects)
  const projectIds = projects.map(obj => obj.id)

  const handleSubmit = (projectName, projectId) => {
    setProjectId(projectId);

    incrementPendingRequests()
    addProject(projectId, projectName)
      .then(({ queued }) => {
        if (!queued) {
          setCurrent("2");
        }
        notify("success", "Success", queued ? actionQueuedMessage : "Project created successfully with suitable defaults")
      }).catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to set project" : error.msg))
      .finally(() => decrementPendingRequests())
  };

  const handleAddDatabase = (alias, connectionString, dbType, dbName) => {
    incrementPendingRequests()
    addDatabase(projectId, alias, dbType, dbName, connectionString)
      .then(({ queued }) => {
        if (!queued) {
          openProject(projectId)
          notify("success", "Success", "Successfully added database")
        } else {
          notify("success", "Success", actionQueuedMessage)
        }
      })
      .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to set db-config" : error.msg))
      .finally(() => decrementPendingRequests())
  }

  const handleSkipAddDatabase = () => {
    openProject(projectId)
  }

  return (
    <React.Fragment>
      <Topbar />
      <div className="create-project">
        <p style={{ fontWeight: "bold" }}><b>Create new project</b></p>
        <Tabs className="create-project-tabs" activeKey={current}>
          <TabPane tab={<span><AppleOutlined />  Define Project</span>} key="1">
            <Card>
              <CreateProjectForm projects={projectIds} handleSubmit={handleSubmit} />
            </Card>
          </TabPane>
          <TabPane tab={<span><DatabaseOutlined /> Define Database</span>} key="2">
            <Card>
              <CreateDatabase projectId={projectId} handleOnBackClick={() => setCurrent("1")} handleSkipAddDatabase={handleSkipAddDatabase} handleSubmit={handleAddDatabase} ignoreDbAliasCheck />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </React.Fragment>
  )
}

export default CreateProject;
