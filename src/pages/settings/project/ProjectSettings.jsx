import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { get, set, increment, decrement } from "automate-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import SecretConfigure from "../../../components/settings/project/SecretConfigure";
import { getProjectConfig, notify, setProjectConfig, openProject } from "../../../utils";
import client from "../../../client";
import { Button, Row, Col, Divider } from "antd";
import store from "../../../store";
import history from "../../../history";
import WhitelistedDomains from "../../../components/settings/project/WhiteListedDomains";
import AESConfigure from "../../../components/settings/project/AESConfigure";
import GraphQLTimeout from "../../../components/settings/project/GraphQLTimeout";
import DockerRegistry from "../../../components/settings/project/DockerRegistry";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"

const ProjectSettings = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/settings/project");
  }, []);

  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects);
  const loading = useSelector(state => state.pendingRequests > 0)
  let selectedProject = projects.find(project => project.id === projectID);
  if (!selectedProject) selectedProject = {}
  const { modules, ...globalConfig } = selectedProject

  // Derived properties
  const secrets = globalConfig.secrets ? globalConfig.secrets : []
  const aesKey = globalConfig.aesKey
  const contextTime = globalConfig.contextTime
  const dockerRegistry = globalConfig.dockerRegistry

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
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='settings' />
      <ProjectPageLayout>
        <SettingsTabs activeKey="project" projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 12 }}>
              <DockerRegistry dockerRegistry={dockerRegistry} handleSubmit={handleDockerRegistry} />
              <Divider />
              <SecretConfigure secrets={secrets} handleSetSecrets={handleSetSecrets} />
              <Divider />
              <AESConfigure aesKey={aesKey} handleSubmit={handleAES} loading={loading} />
              <Divider />
              <GraphQLTimeout contextTimeGraphQL={contextTime} handleSubmit={handleContextTime} loading={loading} />
              <Divider />
              <WhitelistedDomains domains={domains} handleSubmit={handleDomains} loading={loading} />
              <Divider />
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
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default ProjectSettings;
