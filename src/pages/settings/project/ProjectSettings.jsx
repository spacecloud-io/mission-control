import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { get, set, increment, decrement } from "automate-redux";

import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import SecretConfigure from "../../../components/configure/SecretConfigure";
import EventingConfigure from "../../../components/configure/EventingConfigure";
import ExportImport from "../../../components/configure/ExportImport";
import "./project-settings.css";
import { getProjectConfig, notify, setProjectConfig } from "../../../utils";
import client from "../../../client";
import { Button } from "antd";
import store from "../../../store";
import history from "../../../history";
import { dbIcons } from "../../../utils";
import SettingTabs from "../../../components/settings/SettingTabs";
import Clusters from "../../../components/configure/Clusters";
import WhitelistedDomains from "../../../components/configure/WhiteListedDomains";
import { setProjectGlobal, deleteProject, settingProjectConfig, settingConfig } from '../../../actions/settings'

const ProjectSettings = () => {
  // Router params
  const { projectID, selectedDB } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/configure");
  }, []);

  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects);
  const selectedProject = projects.find(project => project.id === projectID);

  // Derived properties
  const projectName = getProjectConfig(projectID, "name");
  const secret = getProjectConfig(projectID, "secret");
  const domains = getProjectConfig(
    projectID,
    "modules.letsencrypt.domains",
    []
  );

  // Handlers
  const handleSecret = secret => {
    dispatch(increment("pendingRequests"));
    setProjectGlobal(projectID, secret)
      .then(() => notify("success", "Success", "Changed JWT secret successfully"))
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  };

  const removeProjectConfig = () => {
    store.dispatch(increment("pendingRequests"));
    deleteProject(projectID)
      .then(() => {
        notify("success", "Success", "Removed project config successfully")
        history.push(`/mission-control/welcome`)
      })
      .catch(ex => notify("error", "Error removing project config", ex.toString()))
      .finally(() => store.dispatch(decrement("pendingRequests")))
  };

  const importProjectConfig = (projectID, config) => {
    dispatch(increment("pendingRequests"));
    settingProjectConfig(projectID, config, projects)
      .then(() => notify("success", "Success", "Updated project config successfully"))
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  };

  const handleDomains = domains => {
    dispatch(increment("pendingRequests"));
    settingConfig(projectID, domains)
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  return (
    <div className="projectSetting-page">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="settings" />
      <div className="page-content page-content--no-padding">
        <SettingTabs activeKey="Project Settings" projectID={projectID} />
        <div
          className="db-tab-content"
          style={{ paddingTop: 20, paddingBottom: 20 }}
        >
          <h2>JWT Secret</h2>
          <div className="divider" />
          <SecretConfigure secret={secret} handleSubmit={handleSecret} />
          <h2>Export/Import Project Config</h2>
          <div className="divider" />
          <ExportImport
            projectConfig={selectedProject}
            importProjectConfig={importProjectConfig}
          />
          {/* <h2>Project Clusters</h2>
          <div className="divider" />
          <p>Select clusters on which this project should be deployed.</p>
          <Clusters /> */}
          <h2>Whitelisted Domains</h2>
          <div className="divider" />
          <p>
            Add domains you want to whitelist for this project. Space cloud will
            automatically add and renew SSL certificates for these domains{" "}
          </p>
          <WhitelistedDomains domains={domains} handleSubmit={handleDomains} />
          <h2>Delete Project</h2>
          <div className="divider" />
          <p>
            Delete this project config. All services running in this project
            will be stopped and deleted.
          </p>
          <Button type="danger" onClick={removeProjectConfig}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
