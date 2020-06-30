import React, { useEffect, useState } from "react"
import './deployment-logs.css';
import { useParams, useHistory } from "react-router-dom"
import { useSelector } from "react-redux"
import client from "../../../client";
import ReactGA from 'react-ga';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Cascader } from "antd";
import { getProjectConfig } from "../../../utils";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav"
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import DOMPurify from 'dompurify';

const DeploymentTopBar = ({ projectID }) => {

  const history = useHistory()

  return (
    <div style={{
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
      height: 48,
      lineHeight: 48,
      zIndex: 98,
      display: "flex",
      alignItems: "center",
      padding: "0 16px"
    }}>
      <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/deployments/overview`)}>
        <LeftOutlined />
        Go back
        </Button>
      <span style={{ marginLeft: 16 }}>
        Deployment Logs
      </span>
    </div>
  );
}

let result = '';
const DeploymentLogs = (props) => {
  const { projectID } = useParams()
  const [logs, setLogs] = useState("");
  const projects = useSelector(state => state.projects)
  const deployments = getProjectConfig(projects, projectID, "modules.deployments.services", []);
  const deploymentStatus = useSelector(state => state.deploymentStatus);
  const {id, version, replica, task} = props.location.state;

  const fetchLogs = (id, task, replica) => {
    result = '';
    client.deployments.fetchDeploymentLogs(projectID, id, task, replica, (chunk) => {
      const infoIndex = chunk.indexOf("INFO");
      const erroIndex = chunk.indexOf("ERRO");
      if (infoIndex !== -1) {
        const before = chunk.slice(0, infoIndex);
        const after = chunk.slice(infoIndex + 4);
        result += "<p>" + before + `<span class="info">INFO</span>` + after + "</p>";
      }
      if (erroIndex !== -1) {
        const before = chunk.slice(0, erroIndex);
        const after = chunk.slice(erroIndex + 4);
        result += "<p>" + before + `<span class="erro">ERRO</span>` + after + "</p>";
      }
      if (infoIndex === -1 && erroIndex === -1) {
        result += `<p>${chunk}</p>`;
      }
      setLogs(result);
    })
  }
  
  useEffect(() => {
    ReactGA.pageview("/projects/deployments/logs");
    fetchLogs(id, task, replica);
  }, [])

  let options = [];
  let versions = {};
    Object.entries(deploymentStatus).forEach(([serviceID, valueID]) => {
      versions[serviceID] = [];
      valueID.forEach(val => {
        Object.entries(val).forEach(([keyVersion]) => {
          versions[serviceID].push(keyVersion); 
        })
      })
      const replicas = deploymentStatus[serviceID];
      options.push(
        {
          value: serviceID,
          label: serviceID,
          children: versions[serviceID].map(version => ({
            value: version,
            label: version,
            children: replicas.find(val => val[version])[version].replicas.map(replica => ({
              value: replica.ID,
              label: replica.ID,
              children: deployments.find(val => val.id === serviceID && val.version === version).tasks.map(task => (
                {
                  value: task.id,
                  label: task.id
                }
              ))
            }))
          }))
        }
      )
    })

  const onChange = ([id, version, replica, task]) => {
    fetchLogs(id, task, replica)
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='remote-services' />
      <div className='page-content page-content--no-padding'>
        <DeploymentTopBar projectID={projectID} />
        <div style={{ padding: "32px 32px 0" }}>
          <FormItemLabel name="Select target" />
          <Cascader 
           style={{marginBottom: 24}} 
           options={options} 
           onChange={onChange} 
           placeholder="Please select"
           defaultValue={[id, version, replica, task]} 
          />
          <FormItemLabel name="Logs" />
          {logs && <div className="terminal-wrapper" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(logs)}}></div>   
          }
        </div>
      </div>
    </React.Fragment>
  )
}

export default DeploymentLogs