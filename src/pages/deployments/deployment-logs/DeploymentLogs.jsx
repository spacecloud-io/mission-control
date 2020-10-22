import React, { useEffect, useState } from "react"
import './deployment-logs.css';
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import client from "../../../client";
import ReactGA from 'react-ga';
import { Cascader, Alert, Input, Button, Space, Badge } from "antd";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav"
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import { getServices, loadServicesStatus, getServicesStatus } from "../../../operations/deployments";
import { incrementPendingRequests, decrementPendingRequests, notify } from "../../../utils";
import { projectModules } from "../../../constants";
import { getToken } from "../../../operations/cluster";
import Highlighter from 'react-highlight-words';
import { FilterOutlined } from "@ant-design/icons";
import FiltersModal from "../../../components/deployments/filters-modal/FiltersModal";
import { set } from "automate-redux";

const DeploymentLogs = (props) => {
  const { projectID } = useParams()
  const dispatch = useDispatch()
  const [logs, setLogs] = useState([]);
  const deployments = useSelector(state => getServices(state))
  const deploymentStatus = useSelector(state => getServicesStatus(state));
  const { id, version, replica, task } = props.location.state ? props.location.state : {};
  const [cascaderValue, setCascaderValue] = useState([id, version, replica, task])
  const [logsCompleted, setLogsCompleted] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filtersModal, setFiltersModal] = useState(false)
  const regex = new RegExp(searchText)
  const token = getToken()
  const filteredLogs = logs.filter(log => regex.test(log))
  const filters = useSelector(state => state.uiState.deploymentLogsFilters)

  const fetchLogs = (task, replica, filters) => {
    let logs = []
    const promise = client.deployments.fetchDeploymentLogs(projectID, task, replica, filters, token, (newLogs) => {
      logs = [...logs, ...newLogs]
      setLogs(logs);
    }, () => {
      notify("info", "Info", "Logs stream closed!")
      setLogsCompleted(true)
    })
    return promise
  }

  const onFilterLogs = (filters) => {
    dispatch(set("uiState.deploymentLogsFilters", filters))
    fetchLogs(task, replica, filters)
    .then((cancelFunction) => cancelFunction())
    setFiltersModal(false)
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

  const getAlertMsg = () => {

    const toTime = (unit) => {
      switch (unit) {
        case "s":
          return "second"
        case "m":
          return "minute"
        case "h":
          return "hour"
      }
    }
    
    let alertMsg = "";
    alertMsg += filters.tail ? `Showing last ${filters.limit} logs ` : `Showing all logs `;

    switch (filters.since) {
      case "duration":
        alertMsg += `since last ${filters.time} ${toTime(filters.unit)}. To change the applied filters, click the filters button above.`;
        break;

      case "time":
        alertMsg += `since ${filters.date.split(" ")[0]}. To change the applied filters, click the filters button above.`;
        break;
      
      default:
        alertMsg += `since the start. To apply filters, click the filters button above`
    }

    return alertMsg;
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <ProjectPageLayout>
        <InnerTopBar title="Deployment logs" />
        <Content style={{ display: "flex", flexDirection: "column" }}>
          <h3>Select target</h3>
          <Cascader
            style={{ marginBottom: 24, width: 400 }}
            options={options}
            onChange={setCascaderValue}
            placeholder="Please select"
            value={cascaderValue}
          />
          <div style={{ display: 'flex', marginBottom: 16, alignItems: "center" }}>
            <h3 style={{ margin: "auto 0px", flexGrow: 1 }}>Logs</h3>
            <Space size="middle">
              <Input.Search placeholder='Paste any regex pattern to search for logs' style={{ width: '360px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button onClick={() => setFiltersModal(true)}>Filters {Object.keys(filters).length > 0 && filters.since !== "start" ? <Badge dot><FilterOutlined style={{ marginLeft: 8.75 }} /></Badge> : null}</Button>
            </Space>
          </div>
          <Alert
            message={getAlertMsg()}
            type="info"
            showIcon />
          {logs && < div className="terminal-wrapper" >
            {
              filteredLogs.map(log => (
                <p>
                  <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={log} />
                </p>
              ))
            }
          </div>}
          {!logs &&
            (
              <div className="terminal-wrapper" >
                <p>You would see logs here as soon as there are some!</p>
              </div>
            )
          }
        </Content>
      </ProjectPageLayout>
      {filtersModal && (
        <FiltersModal
          onCancel={() => setFiltersModal(false)}
          filterLogs={onFilterLogs}
        />
      )}
    </React.Fragment>
  )
}

export default DeploymentLogs