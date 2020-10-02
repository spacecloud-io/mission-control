import React, { useEffect, useState } from "react"
import './deployment-logs.css';
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import client from "../../../client";
import ReactGA from 'react-ga';
import { Cascader, Alert, Input } from "antd";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav"
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import DOMPurify from 'dompurify';
import { getServices, loadServicesStatus, getServicesStatus } from "../../../operations/deployments";
import { incrementPendingRequests, decrementPendingRequests, notify } from "../../../utils";
import { projectModules } from "../../../constants";
import { getToken } from "../../../operations/cluster";
import Highlighter from 'react-highlight-words';

const DeploymentLogs = (props) => {
  const { projectID } = useParams()
  const [logs, setLogs] = useState("");
  const deployments = useSelector(state => getServices(state))
  const deploymentStatus = useSelector(state => getServicesStatus(state));
  const { id, version, replica, task } = props.location.state ? props.location.state : {};
  const [cascaderValue, setCascaderValue] = useState([id, version, replica, task])
  const [logsCompleted, setLogsCompleted] = useState(false)
  const [searchText, setSearchText] = useState('')
  const regex = new RegExp(`${searchText.toLowerCase()}`)
  const token = getToken()

  const fetchLogs = (task, replica) => {
    let result = '';
    const promise = client.deployments.fetchDeploymentLogs(projectID, task, replica, token, (chunk) => {
      const infoIndex = chunk.indexOf("INFO");
      const errorIndex = chunk.indexOf("ERRO");
      const warnIndex = chunk.indexOf("WARN");

      if (infoIndex !== -1) {
        const before = chunk.slice(0, infoIndex);
        const after = chunk.slice(infoIndex + 4);
        result += "<p>" + before + `<span class="info">INFO</span>` + after + "</p>";
      }
      if (errorIndex !== -1) {
        const before = chunk.slice(0, errorIndex);
        const after = chunk.slice(errorIndex + 4);
        result += "<p>" + before + `<span class="error">ERRO</span>` + after + "</p>";
      }
      if (warnIndex !== -1) {
        const before = chunk.slice(0, warnIndex);
        const after = chunk.slice(warnIndex + 4);
        result += "<p>" + before + `<span class="warn">WARN</span>` + after + "</p>";
      }
      if (infoIndex === -1 && errorIndex === -1 && warnIndex === -1) {
        result += `<p>${chunk}</p>`;
      }
      setLogs(result);
    }, () => {
      notify("info", "Info", "Logs stream closed!")
      setLogsCompleted(true)
    })
    return promise
  }

  useEffect(() => {
    ReactGA.pageview("/projects/deployments/logs");
  }, [])

  useEffect(() => {
    const replica = cascaderValue[2]
    const task = cascaderValue[3]
    setLogsCompleted(false)
    let promise = null
    if (task && replica) {
      promise = fetchLogs(task, replica)
    }
    return () => {
      if (promise) {
        promise.then((cancelFunction) => cancelFunction())
      }
    }
  }, cascaderValue)

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadServicesStatus(projectID)
        .catch(ex => notify("error", "Error fetching status of services", ex))
        .finally(() => decrementPendingRequests());
    }
  }, [projectID])

  let options = [];
  Object.entries(deploymentStatus).forEach(([serviceID, serviceObj = {}]) => {
    options.push(
      {
        value: serviceID,
        label: serviceID,
        children: Object.keys(serviceObj).map(version => {
          const replicas = serviceObj[version] && serviceObj[version].replicas ? serviceObj[version].replicas : []
          return {
            value: version,
            label: version,
            children: replicas.map(replica => {
              const index = deployments.findIndex(val => val.id === serviceID && val.version === version)
              const deploymentObj = index === -1 ? {} : deployments[index]
              const tasks = deploymentObj.tasks ? deploymentObj.tasks : []
              return {
                value: replica.id,
                label: replica.id,
                children: tasks.map(task => (
                  {
                    value: task.id,
                    label: task.id
                  }
                ))
              }
            })
          }
        })
      }
    )
  })

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <ProjectPageLayout>
        <InnerTopBar title="Deployment logs" />
        <Content style={{ display: "flex", flexDirection: "column" }}>
          <FormItemLabel name="Select target" />
          <Cascader
            style={{ marginBottom: 24, width: 400 }}
            options={options}
            onChange={setCascaderValue}
            placeholder="Please select"
            value={cascaderValue}
          />
          <div style={{ display: 'flex', justifyContent:'space-between' }}>
            <FormItemLabel name="Logs" />
            <Input.Search placeholder='Type any regex pattern to search for logs' style={{ width: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)}  /> 
          </div>
          <Alert
            message={logsCompleted ? "The logs stream is closed. Checkout the replica status to make sure the replica is still up." : "Logs are streamed here in realtime."}
            type="info"
            showIcon />
          {logs && <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            className="terminal-wrapper"
            textToHighlight={regex.test(logs.toLowerCase()) ? DOMPurify.sanitize(logs) : ''} />}
          {!logs &&
            (
              <div className="terminal-wrapper" >
                <p>You would see logs here as soon as there are some!</p>
              </div>
            )
          }
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default DeploymentLogs