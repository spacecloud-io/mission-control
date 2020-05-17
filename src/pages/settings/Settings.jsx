import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { get, set, increment, decrement } from "automate-redux";

import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import SecretConfigure from "../../components/configure/SecretConfigure";
import "./settings.css";
import { getProjectConfig, notify, setProjectConfig, openProject } from "../../utils";
import client from "../../client";
import { Button, Row, Col, Card, Typography } from "antd";
import store from "../../store";
import history from "../../history";
import WhitelistedDomains from "../../components/configure/WhiteListedDomains";
import AESConfigure from "../../components/configure/AESConfigure";
import GraphQLTimeout from "../../components/configure/GraphQLTimeout";
import DockerRegistry from "../../components/configure/DockerRegistry";

const Settings = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/settings");
  }, []);

  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects);
  const loading = useSelector(state => state.pendingRequests > 0)
  let selectedProject = projects.find(project => project.id === projectID);
  if (!selectedProject) selectedProject = {}
  const { modules, ...globalConfig } = selectedProject

  // Derived properties
  const projectName = globalConfig.name;
  const secrets = globalConfig.secrets ? globalConfig.secrets : []
  const aesKey = globalConfig.aesKey
  const contextTime = globalConfig.contextTime
  const dockerRegistry = globalConfig.dockerRegistry
  const credentials = useSelector(state => state.credentials)

  const domains = getProjectConfig(
    projects,
    projectID,
    "modules.letsencrypt.domains",
    []
  );
  // Handlers
  const handleSetSecrets = newSecrets => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
      client.projects
        .setProjectGlobalConfig(projectID, Object.assign({}, globalConfig, { secrets: newSecrets }))
        .then(() => {
          setProjectConfig(projectID, "secrets", newSecrets);
          resolve()
        })
        .catch(ex => reject(ex))
        .finally(() => dispatch(decrement("pendingRequests")));
    })
  };

  const handleAES = aesKey => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectGlobalConfig(projectID, Object.assign({}, globalConfig, { aesKey: aesKey }))
      .then(() => {
        setProjectConfig(projectID, "aesKey", aesKey);
        notify("success", "Success", "Changed AES Key successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleDockerRegistry = dockerRegistry => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectGlobalConfig(projectID, Object.assign({}, globalConfig, { dockerRegistry: dockerRegistry }))
      .then(() => {
        setProjectConfig(projectID, "dockerRegistry", dockerRegistry);
        notify("success", "Success", "Configured docker registry successfully");
      })
      .catch(ex => notify("error", "Error", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleContextTime = contextTime => {
    dispatch(increment("pendingRequests"));
    client.projects
      .setProjectGlobalConfig(projectID, Object.assign({}, globalConfig, { contextTime: contextTime }))
      .then(() => {
        setProjectConfig(projectID, "contextTime", contextTime);
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
        if (projectList.length === 0) {
          history.push(`/mission-control/welcome`);
          return
        }
        openProject(projectList[0].id)
      })
      .catch(ex => {
        notify("error", "Error removing project config", ex.toString());
      })
      .finally(() => store.dispatch(decrement("pendingRequests")));
  };


  const handleDomains = domains => {
    dispatch(increment("pendingRequests"));
    client.letsencrypt
      .setConfig(projectID, { domains: domains })
      .then(() => {
        setProjectConfig(projectID, "modules.letsencrypt.domains", domains);
        notify("success", "Success", "Saved whitelisted domains successfully")
      })
      .catch(ex => notify("error", "Error saving domains", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  return (
    <div className="projectSetting-page">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="settings" />
      <div className="page-content">
        <Row>
          <Col lg={{ span: 12 }}>
            <h2>Credentials</h2>
            <Card style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ wordSpacing: 6 }}>
                <b>Username </b>
                <Typography.Paragraph style={{ display: "inline" }} copyable ellipsis>{credentials.user}</Typography.Paragraph>
              </h3>
              <h3 style={{ wordSpacing: 6 }}>
                <b>Access Key </b>
                <Typography.Paragraph style={{ display: "inline" }} copyable={{ text: credentials.pass }} ellipsis>*************************</Typography.Paragraph>
              </h3>
            </Card>
            <div className="divider" />
            <DockerRegistry dockerRegistry={dockerRegistry} handleSubmit={handleDockerRegistry} />
            <div className="divider" />
            <SecretConfigure secrets={secrets} handleSetSecrets={handleSetSecrets} />
            <div className="divider" />
            <AESConfigure aesKey={aesKey} handleSubmit={handleAES} loading={loading} />
            <div className="divider" />
            <GraphQLTimeout contextTimeGraphQL={contextTime} handleSubmit={handleContextTime} loading={loading} />
            <div className="divider" />
            <WhitelistedDomains domains={domains} handleSubmit={handleDomains} loading={loading} />
            <div className="divider" />
            <h2>Delete Project</h2>
            <p>
              Delete this project config. All services running in this project
              will be stopped and deleted.
             </p>
            <Button type="danger" onClick={removeProjectConfig}>
              Remove
          </Button>
          </Col>
        </Row>
      </div>
    </div >
  );
};

export default Settings;
