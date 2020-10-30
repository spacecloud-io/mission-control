import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import { notify, openProject, incrementPendingRequests, decrementPendingRequests, lazyWithPreload } from "../../../utils";
import { Button, Row, Col, Divider } from "antd";
import history from "../../../history";
import WhitelistedDomains from "../../../components/settings/project/WhiteListedDomains";
import AESConfigure from "../../../components/settings/project/AESConfigure";
import GraphQLTimeout from "../../../components/settings/project/GraphQLTimeout";
import DockerRegistry from "../../../components/settings/project/DockerRegistry";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { loadLetsEncryptConfig, saveWhiteListedDomains, getWhiteListedDomains } from "../../../operations/letsencrypt";
import { saveAesKey, saveDockerRegistry, saveContextTimeGraphQL, deleteProject, saveSecret, changePrimarySecret, removeSecret } from "../../../operations/projects";
import { projectModules, actionQueuedMessage } from "../../../constants";
const SecretConfigure = lazyWithPreload(() => import("../../../components/settings/project/SecretConfigure"));

const ProjectSettings = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    incrementPendingRequests()
    loadLetsEncryptConfig(projectID)
      .catch(ex => notify("error", "Error fetching letsencrypt config", ex))
      .finally(() => decrementPendingRequests())
  }, [projectID]);

  // Global state
  const projects = useSelector(state => state.projects);
  const loading = useSelector(state => state.pendingRequests > 0)
  const domains = useSelector(state => getWhiteListedDomains(state))

  // Derived state
  let selectedProject = projects.find(project => project.id === projectID);
  if (!selectedProject) selectedProject = {}

  const secrets = selectedProject.secrets ? selectedProject.secrets : []
  const aesKey = selectedProject.aesKey
  const contextTimeGraphQL = selectedProject.contextTimeGraphQL
  const dockerRegistry = selectedProject.dockerRegistry

  // Handlers
  const handleSaveSecret = (values, index) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveSecret(projectID, values, index)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved secret successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving secret", ex)
          reject()
        })
        .finally(() => decrementPendingRequests());
    })
  }

  const handleChangePrimarySecret = (index) => {
    incrementPendingRequests()
    changePrimarySecret(projectID, index)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Changed primary secret successfully"))
      .catch(ex => notify("error", "Error changing primary secret", ex))
      .finally(() => decrementPendingRequests());
  }

  const handleRemoveSecret = (index) => {
    incrementPendingRequests()
    removeSecret(projectID, index)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Removed secret successfully"))
      .catch(ex => notify("error", "Error removing secret", ex))
      .finally(() => decrementPendingRequests());
  }

  const handleAES = aesKey => {
    incrementPendingRequests()
    saveAesKey(projectID, aesKey)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Changed AES key successfully"))
      .catch(ex => notify("error", "Error changing AES key", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleDockerRegistry = dockerRegistry => {
    incrementPendingRequests()
    saveDockerRegistry(projectID, dockerRegistry)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Changed docker registry successfully"))
      .catch(ex => notify("error", "Error changing docker registry", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleContextTimeGraphQL = contextTimeGraphQL => {
    incrementPendingRequests()
    saveContextTimeGraphQL(projectID, contextTimeGraphQL)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Changed context time successfully"))
      .catch(ex => notify("error", "Error changing context time", ex))
      .finally(() => decrementPendingRequests());
  };

  const removeProjectConfig = () => {
    incrementPendingRequests()
    deleteProject(projectID)
      .then(({ queued, newProjects }) => {
        if (!queued) {
          notify("success", "Success", "Removed project config successfully");
          if (newProjects.length === 0) {
            history.push(`/mission-control/welcome`);
            return
          }
          openProject(newProjects[0].id)
          return
        }
        notify("success", "Success", actionQueuedMessage);
      })
      .catch(ex => notify("error", "Error removing project config", ex.toString()))
      .finally(() => decrementPendingRequests());
  };


  const handleDomains = domains => {
    incrementPendingRequests()
    saveWhiteListedDomains(projectID, domains)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Saved whitelisted domains successfully"))
      .catch(ex => notify("error", "Error saving domains", ex))
      .finally(() => decrementPendingRequests());
  };

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SETTINGS} />
      <ProjectPageLayout>
        <SettingsTabs activeKey="project" projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 12 }}>
              <DockerRegistry dockerRegistry={dockerRegistry} handleSubmit={handleDockerRegistry} />
              <Divider />
              <SecretConfigure
                secrets={secrets}
                handleSaveSecret={handleSaveSecret}
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
