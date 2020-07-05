import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector } from "react-redux";
import { get } from "automate-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import SecretConfigure from "../../../components/settings/project/SecretConfigure";
import { notify, openProject, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { Button, Row, Col, Divider } from "antd";
import store from "../../../store";
import history from "../../../history";
import WhitelistedDomains from "../../../components/settings/project/WhiteListedDomains";
import AESConfigure from "../../../components/settings/project/AESConfigure";
import GraphQLTimeout from "../../../components/settings/project/GraphQLTimeout";
import DockerRegistry from "../../../components/settings/project/DockerRegistry";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { loadLetsEncryptConfig, saveWhiteListedDomains } from "../../../operations/letsencrypt";
import { saveAesKey, saveDockerRegistry, saveContextTimeGraphQL, deleteProject, addSecret, changePrimarySecret, removeSecret } from "../../../operations/projects";

const ProjectSettings = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/settings/project");
  }, []);

  useEffect(() => {
    incrementPendingRequests()
    loadLetsEncryptConfig(projectID)
      .catch(ex => notify("error", "Error fetching letsencrypt config", ex))
      .finally(() => decrementPendingRequests())
  }, [projectID]);

  // Global state
  const projects = useSelector(state => state.projects);
  const loading = useSelector(state => state.pendingRequests > 0)
  let selectedProject = projects.find(project => project.id === projectID);
  if (!selectedProject) selectedProject = {}

  // Derived state
  const secrets = selectedProject.secrets ? selectedProject.secrets : []
  const aesKey = selectedProject.aesKey
  const contextTimeGraphQL = selectedProject.contextTimeGraphQL
  const dockerRegistry = selectedProject.dockerRegistry

  const domains = get(store.getState(), "letsencrypt.domains", [])
  // Handlers
  const handleAddSecret = (secret, isPrimary) => {
    incrementPendingRequests()
    addSecret(projectID, secret, isPrimary)
      .then(() => notify("success", "Success", "Added new secret successfully"))
      .catch(ex => notify("error", "Error adding secret", ex))
      .finally(() => decrementPendingRequests());
  }

  const handleChangePrimarySecret = (secret) => {
    incrementPendingRequests()
    changePrimarySecret(projectID, secret)
      .then(() => notify("success", "Success", "Changed primary secret successfully"))
      .catch(ex => notify("error", "Error changing primary secret", ex))
      .finally(() => decrementPendingRequests());
  }

  const handleRemoveSecret = (secret) => {
    incrementPendingRequests()
    removeSecret(projectID, secret)
      .then(() => notify("success", "Success", "Removed secret successfully"))
      .catch(ex => notify("error", "Error removing secret", ex))
      .finally(() => decrementPendingRequests());
  }

  const handleAES = aesKey => {
    incrementPendingRequests()
    saveAesKey(projectID, aesKey)
      .then(() => notify("success", "Success", "Changed AES key successfully"))
      .catch(ex => notify("error", "Error changing AES key", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleDockerRegistry = dockerRegistry => {
    incrementPendingRequests()
    saveDockerRegistry(projectID, dockerRegistry)
      .then(() => notify("success", "Success", "Changed docker registry successfully"))
      .catch(ex => notify("error", "Error changing docker registry", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleContextTimeGraphQL = contextTimeGraphQL => {
    incrementPendingRequests()
    saveContextTimeGraphQL(projectID, contextTimeGraphQL)
      .then(() => notify("success", "Success", "Changed context time successfully"))
      .catch(ex => notify("error", "Error changing context time", ex))
      .finally(() => decrementPendingRequests());
  };

  const removeProjectConfig = () => {
    incrementPendingRequests()
    deleteProject(projectID)
      .then((newProjects) => {
        notify("success", "Success", "Removed project config successfully");
        if (newProjects.length === 0) {
          history.push(`/mission-control/welcome`);
          return
        }
        openProject(newProjects[0].id)
      })
      .catch(ex => notify("error", "Error removing project config", ex.toString()))
      .finally(() => decrementPendingRequests());
  };


  const handleDomains = domains => {
    incrementPendingRequests()
    saveWhiteListedDomains(projectID, domains)
      .then(() => notify("success", "Success", "Saved whitelisted domains successfully"))
      .catch(ex => notify("error", "Error saving domains", ex))
      .finally(() => decrementPendingRequests());
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
              <SecretConfigure
                secrets={secrets}
                handleAddSecret={handleAddSecret}
                handleChangePrimarySecret={handleChangePrimarySecret}
                handleRemoveSecret={handleRemoveSecret} />
              <Divider />
              <AESConfigure aesKey={aesKey} handleSubmit={handleAES} loading={loading} />
              <Divider />
              <GraphQLTimeout contextTimeGraphQL={contextTimeGraphQL} handleSubmit={handleContextTimeGraphQL} loading={loading} />
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
