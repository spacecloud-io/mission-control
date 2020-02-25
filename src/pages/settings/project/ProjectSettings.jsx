import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { get, set, increment, decrement } from "automate-redux";

import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import SecretConfigure from "../../../components/configure/SecretConfigure";
import ExportImport from "../../../components/configure/ExportImport";
import "./project-settings.css";
import { getProjectConfig, notify, setProjectConfig } from "../../../utils";
import client from "../../../client";
import { Button, Row, Col } from "antd";
import store from "../../../store";
import history from "../../../history";
import { dbIcons } from "../../../utils";
import SettingTabs from "../../../components/settings/SettingTabs";
import Clusters from "../../../components/configure/Clusters";
import WhitelistedDomains from "../../../components/configure/WhiteListedDomains";
import AESConfigure from "../../../components/configure/AESConfigure";
import GraphQLTimeout from "../../../components/configure/GraphQLTimeout";

const ProjectSettings = () => {
  // Router params
  const { projectID, selectedDB } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/configure");
  }, []);

  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects);
  let selectedProject = projects.find(project => project.id === projectID);
  if (!selectedProject) selectedProject = {}

  // Derived properties
  const projectName = getProjectConfig(projects, projectID, "name");
  const secret = getProjectConfig(projects, projectID, "secret");
  const aesKey = getProjectConfig(projects, projectID, "aesKey");
  const contextTimeout = getProjectConfig(projects, projectID, "contextTimeout");
  const {modules, ...globalConfig} = selectedProject
  const domains = getProjectConfig(
    projects,
    projectID,
    "modules.letsencrypt.domains",
    []
  );
  // Handlers
  const handleSecret = secret => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectGlobalConfig(projectID, Object.assign(globalConfig, {}, { secret: secret }))
      .then(() => {
        setProjectConfig(projectID, "secret", secret);
        notify("success", "Success", "Changed JWT secret successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleAES = aesKey => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectGlobalConfig(projectID, Object.assign(globalConfig, {}, { aesKey: aesKey }))
      .then(() => {
        setProjectConfig(projectID, "aesKey", aesKey);
        notify("success", "Success", "Changed AES Key successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleContextTimeout = contextTimeout => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectGlobalConfig(projectID, Object.assign(globalConfig, {}, { contextTimeout: contextTimeout }))
      .then(() => {
        setProjectConfig(projectID, "contextTimeout", contextTimeout);
        notify("success", "Success", "Changed GraphQL timeout successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const removeProjectConfig = () => {
    store.dispatch(increment("pendingRequests"));
    client.projects
      .deleteProject(projectID)
      .then(() => {
        notify("success", "Success", "Removed project config successfully");
        const extraConfig = get(store.getState(), "extraConfig", {});
        const newExtraConfig = delete extraConfig[projectID];
        store.dispatch(set(`extraConfig`, newExtraConfig));
        const projectConfig = store.getState().projects;
        const projectList = projectConfig.filter(
          project => project.id !== projectID
        );
        store.dispatch(set(`projects`, projectList));
        history.push(`/mission-control/welcome`);
      })
      .catch(ex => {
        notify("error", "Error removing project config", ex.toString());
      })
      .finally(() => store.dispatch(decrement("pendingRequests")));
  };

  const importProjectConfig = (projectID, config) => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectConfig(projectID, config)
      .then(() => {
        const updatedProjects = projects.map(project => {
          if (project.id === config.id) {
            project.secret = config.secret;
            project.aesKey = config.aesKey;
            project.contextTimeout = config.contextTimeout;
            project.modules = config.modules;
          }
          return project;
        });
        store.dispatch(set("projects", updatedProjects));
        notify("success", "Success", "Updated project config successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleDomains = domains => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
      client.letsencrypt
        .setConfig(projectID, { domains: domains })
        .then(() => {
          setProjectConfig(projectID, "modules.letsencrypt.domains", domains);
          resolve();
        })
        .catch(ex => reject(ex))
        .finally(() => dispatch(decrement("pendingRequests")));
    });
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
          <Row>
            <Col lg={{ span: 12}}>
              <h2>JWT Secret</h2>
              <div className="divider" />
              <SecretConfigure secret={secret} handleSubmit={handleSecret} />
              <h2>AES Key</h2>
              <div className="divider" />
              <AESConfigure aesKey={aesKey} handleSubmit={handleAES} />
              <h2>GraphQL Timeout (in seconds)</h2>
              <div className="divider" />
              <GraphQLTimeout contextTimeout={contextTimeout} handleSubmit={handleContextTimeout} />
            </Col>
          </Row>
          {/* <h2>Export/Import Project Config</h2>
          <div className="divider" />
          <ExportImport
            projectConfig={selectedProject}
            importProjectConfig={importProjectConfig}
          /> */}
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
