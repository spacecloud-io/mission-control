import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Table, Popconfirm, Tag, Input, Empty } from "antd";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import DeploymentTabs from "../../../components/deployments/deployment-tabs/DeploymentTabs";
import source_code from "../../../assets/source_code.svg";
import { notify, incrementPendingRequests, decrementPendingRequests, capitalizeFirstCharacter } from "../../../utils";
import { decrement } from "automate-redux";
import { deleteService, getServices, getServicesStatus, loadServicesStatus } from "../../../operations/deployments";
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { projectModules, deploymentStatuses, actionQueuedMessage } from "../../../constants";
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../../components/utils/empty-search-results/EmptySearchResults"

const DeploymentsOverview = () => {
  const { projectID } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadServicesStatus(projectID)
        .catch(ex => notify("error", "Error fetching status of services", ex))
        .finally(() => decrementPendingRequests());
    }
  }, [projectID])

  // Global state
  const deployments = useSelector(state => getServices(state))
  const deploymentStatus = useSelector(state => getServicesStatus(state));
  const [searchText, setSearchText] = useState('')

  const calculateStatus = (desiredReplicas, totalReplicas) => {
    const percent = totalReplicas / desiredReplicas * 100;
    if (percent >= 80) {
      return 'healthy'
    } else if (percent > 0 && percent < 80) {
      return 'unhealthy'
    } else {
      return 'dead'
    }
  }

  // Derived state
  const data = deployments.map(obj => {
    const task = obj.tasks && obj.tasks.length ? obj.tasks[0] : {};
    const desiredReplicas = deploymentStatus[obj.id] && deploymentStatus[obj.id][obj.version] ? deploymentStatus[obj.id][obj.version].desiredReplicas : 0
    const totalReplicas = deploymentStatus[obj.id] && deploymentStatus[obj.id][obj.version] && deploymentStatus[obj.id][obj.version].replicas ? deploymentStatus[obj.id][obj.version].replicas.filter(obj => obj.status === deploymentStatuses.RUNNING).length : 0
    return {
      id: obj.id,
      version: obj.version,
      serviceType: task.runtime,
      dockerImage: task.docker.image,
      dockerSecret: task.docker.secret,
      imagePullPolicy: task.docker.imagePullPolicy,
      secrets: task.secrets ? task.secrets : [],
      registryType: task.docker.secret ? "private" : "public",
      ports: task.ports,
      cpu: task.resources.cpu / 1000,
      memory: task.resources.memory,
      gpuType: task.resources.gpu ? task.resources.gpu.type : "",
      gpuCount: task.resources.gpu ? task.resources.gpu.value : 0,
      min: obj.autoScale.minReplicas,
      max: obj.autoScale.maxReplicas,
      replicas: obj.autoScale.replicas,
      pollingInterval: obj.autoScale.pollingInterval,
      coolDownInterval: obj.autoScale.coolDownInterval,
      env: task.env
        ? Object.entries(task.env).map(([key, value]) => ({
          key: key,
          value: value
        }))
        : [],
      whitelists: obj.whitelists,
      upstreams: obj.upstreams,
      statsInclusionPrefixes: obj.statsInclusionPrefixes,
      desiredReplicas: desiredReplicas,
      totalReplicas: totalReplicas,
      status: calculateStatus(desiredReplicas, totalReplicas),
      deploymentStatus: deploymentStatus[obj.id] && deploymentStatus[obj.id][obj.version] && deploymentStatus[obj.id][obj.version].replicas ? deploymentStatus[obj.id][obj.version].replicas : []
    };
  });

  const filteredData = data.filter(service => {
    return service.id.toLowerCase().includes(searchText.toLowerCase())
  })

  // Handlers
  const handleEditDeploymentClick = (serviceId, version) => {
    const deploymentClickedInfo = deployments.find(
      obj =>
        obj.id === serviceId &&
        obj.version === version
    );
    history.push(`/mission-control/projects/${projectID}/deployments/configure`, { deploymentClickedInfo })
  };

  const handleDelete = (serviceId, version) => {
    incrementPendingRequests()
    deleteService(projectID, serviceId, version)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Successfully deleted service"))
      .catch(ex => notify("error", "Error deleting service", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const expandedRowRender = (record) => {
    const column = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: 'Status',
        render: (_, { status }) => {
          const statusText = capitalizeFirstCharacter(status)
          if (status === deploymentStatuses.RUNNING || status === deploymentStatuses.SUCCEEDED) return <span style={{ color: '#52c41a' }}><CheckCircleOutlined /> {statusText}</span>
          else if (status === deploymentStatuses.FAILED) return <span style={{ color: '#f5222d' }}><CloseCircleOutlined /> {statusText}</span>
          else return <span style={{ color: '#fa8c16' }}><ExclamationCircleOutlined /> {statusText}</span>
        },
        filters: [
          { text: 'Running', value: deploymentStatuses.RUNNING },
          { text: 'Pending', value: deploymentStatuses.PENDING },
          { text: 'Failed', value: deploymentStatuses.FAILED },
          { text: 'Successed', value: deploymentStatuses.SUCCEEDED },
          { text: 'Unknown', value: deploymentStatuses.UNKNOWN }
        ],
        onFilter: (value, record) => record.status.indexOf(value) === 0
      },
      {
        title: 'Action',
        key: 'Action',
        render: (_, row) =>
          <Button
            type="link"
            style={{ color: "#008dff" }}
            onClick={() => {
              const task = deployments.find(({ id, version }) => id === record.id && version === record.version).tasks[0].id
              history.push(`/mission-control/projects/${projectID}/deployments/logs`, { id: record.id, version: record.version, replica: row.id, task: task });
            }}
          >
            View logs
          </Button>
      }
    ]

    return (
      <Table
        columns={column}
        dataSource={record.deploymentStatus}
        pagination={false}
        title={() => 'Replicas'}
      />)
  }
  const tableColumns = [
    {
      title: "Service ID",
      dataIndex: "id",
      key: "id",
      render: (value) => {
        return <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={value ? value.toString() : ''}
        />
      }
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version"
    },
    {
      title: "Private URL",
      key: "url",
      render: (_, record) => `${record.id}.${projectID}.svc.cluster.local`
    },
    {
      title: "Status",
      key: "status",
      dataIndex: 'status',
      render: (_, { status }) => {
        if (status === 'healthy') return <Tag icon={<CheckCircleOutlined />} color="success">{capitalizeFirstCharacter(status)}</Tag>
        else if (status === 'unhealthy') return <Tag icon={<ExclamationCircleOutlined />} color="warning" >{capitalizeFirstCharacter(status)}</Tag>
        else return <Tag icon={<CloseCircleOutlined />} color="error">{capitalizeFirstCharacter(status)}</Tag>
      },
      filters: [
        { text: 'Healthy', value: 'healthy' },
        { text: 'Unhealthy', value: 'unhealthy' },
        { text: 'Dead', value: 'dead' }
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0
    },
    {
      title: "Health",
      key: "health",
      render: (row) => `${row.totalReplicas}/${row.desiredReplicas}`
    },
    {
      title: "Actions",
      key: "actions",
      className: "column-actions",
      render: (_, { id, version }) => (
        <span>
          <a onClick={() => handleEditDeploymentClick(id, version)}>Edit</a>
          <Popconfirm
            title={`This will remove this deployment config and stop all running instances of it. Are you sure?`}
            onConfirm={() => handleDelete(id, version)}
          >
            <a style={{ color: "red" }}>Remove</a>
          </Popconfirm>
        </span>
      )
    }
  ];

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.DEPLOYMENTS} />
      <div className="page-content page-content--no-padding">
        <DeploymentTabs activeKey="overview" projectID={projectID} />
        <div style={{ padding: "32px 32px 0" }}>
          {!data ||
            (data.length === 0 && (
              <div className="panel" style={{ margin: 24 }}>
                <img src={source_code} style={{ width: "45%" }} />
                <p
                  className="panel__description"
                  style={{
                    marginTop: 48,
                    marginBottom: 0,
                    marginLeft: 130,
                    marginRight: 130
                  }}
                >
                  Deploy any docker containers in no time. Space
                  Cloud deploys your docker containers in a secure service mesh
                  and provides you with a serverless experience by taking care
                  of auto scaling, self healing, etc.
                </p>
                <Button
                  type="primary"
                  style={{ marginTop: 16 }}
                  onClick={() => history.push(`/mission-control/projects/${projectID}/deployments/configure`)}
                >
                  Deploy your first container
                </Button>
              </div>
            ))}
          {data && data.length !== 0 && (
            <React.Fragment>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
                <h3 style={{ margin: 'auto 0' }}>Your Deployments {filteredData.length ? `(${filteredData.length})` : ''}</h3>
                <div style={{ display: 'flex' }}>
                  <Input.Search placeholder='Search by service id' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
                  <Button style={{ marginLeft: '16px' }} onClick={() => history.push(`/mission-control/projects/${projectID}/deployments/configure`)} type="primary">Add</Button>
                </div>
              </div>
              <Table
                bordered={true}
                columns={tableColumns}
                dataSource={filteredData}
                rowKey={(record) => record.id + record.version}
                expandedRowRender={expandedRowRender}
                style={{ marginTop: 16 }}
                locale={{
                  emptyText: data.length !== 0 ?
                    <EmptySearchResults searchText={searchText} /> :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No deployment service created yet. Add a service' />
                }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default DeploymentsOverview;
