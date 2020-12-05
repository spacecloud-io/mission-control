import React, { useEffect, useState } from "react"
import './deployment-logs.css';
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { Cascader, Alert, Input, Button, Space, Badge } from "antd";
import Topbar from "../../../components/topbar/Topbar";
import Sidenav from "../../../components/sidenav/Sidenav"
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout";
import { getServices, loadServicesStatus, getServicesStatus, loadServiceLogs, getServiceLogs, getServiceLogsFilters, setServiceLogsFilters } from "../../../operations/deployments";
import { incrementPendingRequests, decrementPendingRequests, notify } from "../../../utils";
import { projectModules } from "../../../constants";
import Highlighter from 'react-highlight-words';
import { FilterOutlined } from "@ant-design/icons";
import FiltersModal from "../../../components/deployments/filters-modal/FiltersModal";

let logsStreamCanceller = null

const DeploymentLogs = (props) => {
  const { projectID } = useParams()
  const logs = useSelector(state => getServiceLogs(state))
  const deployments = useSelector(state => getServices(state))
  const deploymentStatus = useSelector(state => getServicesStatus(state));
  const { id, version, replica, task } = props.location.state ? props.location.state : {};
  const [cascaderValue, setCascaderValue] = useState([id, version, replica, task])
  const [searchText, setSearchText] = useState('')
  const [filtersModalVisible, setFiltersModalVisible] = useState(false)
  const filteredLogs = searchText ? logs.filter(log => log.toLowerCase().includes(searchText)) : logs
  const filters = useSelector(state => getServiceLogsFilters(state))

  const onFilterLogs = (filters) => {
    setServiceLogsFilters(filters)
    setFiltersModalVisible(false)
  }

  useEffect(() => {
    const replica = cascaderValue[2]
    const task = cascaderValue[3]
    if (task && replica) {
      loadServiceLogs(projectID, task, replica).then(cancel => {
        logsStreamCanceller = cancel
      })

      return () => {
        if (logsStreamCanceller) {
          logsStreamCanceller()
          logsStreamCanceller = null
        }
      }
    }
  }, [cascaderValue[2], cascaderValue[3], JSON.stringify(filters)])

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

    const getDuration = (time, unit) => {
      let unitString = ""
      switch (unit) {
        case "s":
          unitString = "second"
          break
        case "m":
          unitString = "minute"
          break
        case "h":
          unitString = "hour"
          break
      }
      if (time > 1) {
        unitString = unitString + "s"
      }
      return `${time} ${unitString}`
    }

    let alertMsg = "";
    alertMsg += filters.tail ? `Showing recent ${filters.limit} logs ` : `Showing all logs `;

    switch (filters.since) {
      case "duration":
        alertMsg += `since last ${getDuration(filters.time, filters.unit)}. To change the applied filters, click the filters button above.`;
        break;

      case "time":
        alertMsg += `since ${filters.date}. To change the applied filters, click the filters button above.`;
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
              <Input.Search placeholder='Search for logs' style={{ width: '360px' }} allowClear={true} onChange={e => setSearchText(e.target.value.toLowerCase())} />
              <Button onClick={() => setFiltersModalVisible(true)}>Filters {Object.keys(filters).length > 0 && filters.since !== "start" ? <Badge dot><FilterOutlined style={{ marginLeft: 8.75 }} /></Badge> : null}</Button>
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
                    textToHighlight={log}
                    autoEscape />
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
      {filtersModalVisible && (
        <FiltersModal
          initialValues={filters}
          handleCancel={() => setFiltersModalVisible(false)}
          handleSubmit={onFilterLogs}
        />
      )}
    </React.Fragment>
  )
}

export default DeploymentLogs