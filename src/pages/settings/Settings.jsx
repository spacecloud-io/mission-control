import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector, useDispatch } from "react-redux";
import { get, set, increment, decrement } from "automate-redux";

import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import SecretConfigure from "../../components/configure/SecretConfigure";
import "./settings.css";
import { getProjectConfig, notify, setProjectConfig } from "../../utils";
import client from "../../client";
import { Button, Row, Col, Card } from "antd";
import store from "../../store";
import history from "../../history";
import WhitelistedDomains from "../../components/configure/WhiteListedDomains";
import AESConfigure from "../../components/configure/AESConfigure";
import GraphQLTimeout from "../../components/configure/GraphQLTimeout";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Settings = () => {
  // Router params
  const { projectID } = useParams();

  useEffect(() => {
    ReactGA.pageview("/projects/settings");
  }, []);

  const dispatch = useDispatch();

  // Global state
  const projects = useSelector(state => state.projects);
  let selectedProject = projects.find(project => project.id === projectID);
  if (!selectedProject) selectedProject = {}
  const { modules, ...globalConfig } = selectedProject

  const [nameCopy, setNameCopy] = useState("copy")
  const [keyCopy, setKeyCopy] = useState("copy")

  // Derived properties
  const projectName = globalConfig.name;
  const secret = globalConfig.secret
  const aesKey = globalConfig.aesKey
  const contextTime = globalConfig.contextTime
  const cred = useSelector(state => state.cred)

  const copyValue = (e, text) => {
    e.preventDefault();
    if (text === "username") {
      setNameCopy("copied");
      setKeyCopy("copy")
      setTimeout(() => setNameCopy("copy"), 5000);
    } else {
      setKeyCopy("copied");
      setNameCopy("copy")
      setTimeout(() => setKeyCopy("copy"), 5000);
    }
  }

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
      .setProjectGlobalConfig(projectID, Object.assign({}, globalConfig, { secret: secret }))
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
      .setProjectGlobalConfig(projectID, Object.assign({}, globalConfig, { aesKey: aesKey }))
      .then(() => {
        setProjectConfig(projectID, "aesKey", aesKey);
        notify("success", "Success", "Changed AES Key successfully");
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
        history.push(`/mission-control/welcome`);
      })
      .catch(ex => {
        notify("error", "Error removing project config", ex.toString());
      })
      .finally(() => store.dispatch(decrement("pendingRequests")));
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
      <div className="page-content">
        <Row>
          <Col lg={{ span: 12 }}>
            <h2>Credentials</h2>
            <Card style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ wordSpacing: 6 }}><b>username </b> {cred.userName}  <CopyToClipboard text={cred.userName}>
                <a onClick={(e) => copyValue(e, "username")}>{nameCopy}</a>
              </CopyToClipboard></h3>
              <h3 style={{ wordSpacing: 6 }}><b>Access Key </b>  ************************* <CopyToClipboard text={cred.accessKey}>
                <a onClick={(e) => copyValue(e, "AccessKey")}>{keyCopy}</a>
              </CopyToClipboard></h3>
            </Card>
            <br />
            <h2>JWT Secret</h2>
            <div className="divider" />
            <SecretConfigure secret={secret} handleSubmit={handleSecret} />
            <h2>AES Key</h2>
            <div className="divider" />
            <AESConfigure aesKey={aesKey} handleSubmit={handleAES} />
            <h2>GraphQL Timeout (in seconds)</h2>
            <div className="divider" />
            <GraphQLTimeout contextTime={contextTime} handleSubmit={handleContextTime} />
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
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Settings;
