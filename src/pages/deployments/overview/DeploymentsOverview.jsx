import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ReactGA from "react-ga";
import { Button, Table, Popconfirm, Tag } from "antd";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import DeploymentTabs from "../../../components/deployments/deployment-tabs/DeploymentTabs";
import AddDeploymentForm from "../../../components/deployments/add-deployment/AddDeploymentForm";
import source_code from "../../../assets/source_code.svg";
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { decrement } from "automate-redux";
import { deleteService, saveService, getServices } from "../../../operations/deployments";
import { loadSecrets, getSecrets } from "../../../operations/secrets";
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const DeploymentsOverview = () => {
  const { projectID } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const getStatus = () => {
    dispatch(increment("pendingRequests"));
    client.deployments.fetchDeploymentStatus(projectID)
      .then(res => dispatch(set("deploymentStatus", res)))
      .catch(ex => notify("error", "Error", ex, 5))
      .finally(() => dispatch(decrement("pendingRequests")));
  }

  useEffect(() => {
    ReactGA.pageview("/projects/deployments/overview");
    getStatus();
  }, []);

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecrets(projectID)
        .catch(ex => notify("error", "Error fetching secrets", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  // Global state
  const deployments = useSelector(state => getServices(state))
  const deploymentStatus = useSelector(state => state.deploymentStatus);
  const totalSecrets = useSelector(state => getSecrets(state))

  // Component state
  const [modalVisibility, setModalVisibility] = useState(false);
  const [deploymentClicked, setDeploymentClicked] = useState(null);

  // Derived state
  const dockerSecrets = totalSecrets
    .filter(obj => obj.type === "docker")
    .map(obj => obj.id);
  const secrets = totalSecrets
    .filter(obj => obj.type !== "docker")
    .map(obj => obj.id);

  const data = deployments.map(obj => {
    const task = obj.tasks && obj.tasks.length ? obj.tasks[0] : {};
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
      min: obj.scale.minReplicas,
      max: obj.scale.maxReplicas,
      replicas: obj.scale.replicas,
      autoscalingMode: obj.scale.mode,
      concurrency: obj.scale.concurrency,
      env: task.env
        ? Object.entries(task.env).map(([key, value]) => ({
          key: key,
          value: value
        }))
        : [],
      whitelists: obj.whitelists,
      upstreams: obj.upstreams,
      desiredReplicas: deploymentStatus[obj.id] && deploymentStatus[obj.id].find(val => val[obj.version]) ? deploymentStatus[obj.id].find(val => val[obj.version])[obj.version].desiredReplicas : 0,
      totalReplicas: deploymentStatus[obj.id] && deploymentStatus[obj.id].find(val => val[obj.version]) ? deploymentStatus[obj.id].find(val => val[obj.version])[obj.version].replicas.length : 0,
      deploymentStatus: deploymentStatus[obj.id] && deploymentStatus[obj.id].find(val => val[obj.version]) ? deploymentStatus[obj.id].find(val => val[obj.version])[obj.version].replicas : []
    };
  });

  const deploymentClickedInfo = deploymentClicked
    ? data.find(
      obj =>
        obj.id === deploymentClicked.serviceId &&
        obj.version === deploymentClicked.version
    )
    : undefined;

  // Handlers
  const handleEditDeploymentClick = (serviceId, version) => {
    setDeploymentClicked({ serviceId, version });
    setModalVisibility(true);
  };

  const handleSubmit = (operation, values) => {
    return new Promise((resolve, reject) => {
      const c = deploymentClicked ? deployments.find(obj => obj.id === deploymentClicked.serviceId && obj.version === deploymentClicked.version) : undefined
      const dockerCommands = (c && c.tasks && c.tasks.length) ? c.tasks[0].docker.cmd : []
      const serviceId = values.id;

      let config = {
        id: serviceId,
        version: values.version,
        projectId: projectID,
        scale: {
          replicas: 0,
          minReplicas: values.min,
          maxReplicas: values.max,
          concurrency: values.concurrency,
          mode: values.autoscalingMode
        },
        tasks: [
          {
            id: values.id,
            ports: values.ports.map(obj =>
              Object.assign(obj, { name: obj.protocol })
            ),
            resources: {
              cpu: values.cpu * 1000,
              memory: values.memory,
              gpu: values.gpu,
            },
            docker: {
              image: values.dockerImage,
              secret: values.dockerSecret,
              imagePullPolicy: values.imagePullPolicy,
              cmd: dockerCommands
            },
            secrets: values.secrets,
            env: values.env
              ? values.env.reduce((prev, curr) => {
                return Object.assign({}, prev, { [curr.key]: curr.value });
              }, {})
              : {},
            runtime: values.serviceType
          }
        ],
        whitelists: values.whitelists,
        upstreams: values.upstreams
      };
      incrementPendingRequests()
      saveService(projectID, config.id, config.version, config)
        .then(() => {
          notify("success", "Success", `${operation === "add" ? "Deployed" : "Updated"} service successfully`)
          resolve()
        })
        .catch(ex => {
          notify("error", `Error ${operation === "add" ? "deploying" : "updating"} service`, ex)
          reject(ex)
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleDelete = (serviceId, version) => {
    incrementPendingRequests()
    deleteService(projectID, serviceId, version)
      .then(() => notify("success", "Success", "Successfully deleted service"))
      .catch(ex => notify("error", "Error deleting service", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleCancel = () => {
    setModalVisibility(false);
    setDeploymentClicked(null);
  };

  const expandedRowRender = (record) => {
    const column = [
      {
        title: 'Replica',
        dataIndex: 'ID',
        key: 'Replica'
      },
      {
        title: 'Status',
        dataIndex: 'Status',
        key: 'status',
        render: (row) => {
          const status = row.charAt(0).toUpperCase() + row.slice(1);
          if (status === "Running") return <span style={{ color: '#52c41a' }}><CheckCircleOutlined /> {status}</span>
          else if (status === "Failed") return <span style={{ color: '#f5222d' }}><CloseCircleOutlined /> {status}</span>
          else return <span style={{ color: '#fa8c16' }}><ExclamationCircleOutlined /> {status}</span>
        }
      },
      {
        title: 'Action',
        key: 'Action',
        render: (row) =>
          <Button
            type="link"
            style={{ color: "#008dff" }}
            onClick={() => {
              const task = deployments.find(({ id, version }) => id === record.id && version === record.version).tasks[0].id
              history.push(`/mission-control/projects/${projectID}/deployments/logs`, { id: record.id, version: record.version, replica: row.ID, task: task });
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
      key: "id"
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
      render: (row) => {
        const percent = row.totalReplicas / row.desiredReplicas * 100;
        if (percent >= 80) return <Tag icon={<CheckCircleOutlined />} color="success">Healthy</Tag>
        else if (percent < 80 && percent > 0) return <Tag icon={<ExclamationCircleOutlined />} color="warning" >Unhealthy</Tag>
        else return <Tag icon={<CloseCircleOutlined />} color="error">Dead</Tag>
      }
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
      <Sidenav selectedItem="deployments" />
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
                  onClick={() => setModalVisibility(true)}
                >
                  Deploy your first container
                </Button>
              </div>
            ))}
          {data && data.length !== 0 && (
            <React.Fragment>
              <div>
                <span style={{ fontSize: 18, fontWeight: "bold" }}>
                  Your Deployments
                </span>
                <Button
                  style={{ float: "right" }}
                  onClick={() => setModalVisibility(true)}
                >
                  Add
                </Button>
              </div>
              <Table
                bordered={true}
                columns={tableColumns}
                dataSource={data}
                rowKey={(record) => record.id + record.version}
                expandedRowRender={expandedRowRender}
                style={{ marginTop: 16 }}
              />
            </React.Fragment>
          )}
        </div>
      </div>
      {modalVisibility && (
        <AddDeploymentForm
          visible={modalVisibility}
          initialValues={deploymentClickedInfo}
          projectId={projectID}
          dockerSecrets={dockerSecrets}
          secrets={secrets}
          handleCancel={handleCancel}
          handleSubmit={values =>
            handleSubmit(deploymentClickedInfo ? "update" : "add", values)
          }
        />
      )}
    </React.Fragment>
  );
};

export default DeploymentsOverview;
