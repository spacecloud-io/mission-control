import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ReactGA from "react-ga";
import { Button, Table, Popconfirm } from "antd";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import DeploymentTabs from "../../../components/deployments/deployment-tabs/DeploymentTabs";
import AddDeploymentForm from "../../../components/deployments/add-deployment/AddDeploymentForm";
import client from "../../../client";
import source_code from "../../../assets/source_code.svg";
import { getProjectConfig, setProjectConfig, notify } from "../../../utils";
import { increment, decrement } from "automate-redux";

const DeploymentsOverview = () => {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const deployments = getProjectConfig(
    projects,
    projectID,
    "modules.deployments.services",
    []
  );
  const totalSecrets = getProjectConfig(
    projects,
    projectID,
    "modules.secrets",
    []
  );
  const dockerSecrets = totalSecrets
    .filter(obj => obj.type === "docker")
    .map(obj => obj.id);
  const secrets = totalSecrets
    .filter(obj => obj.type !== "docker")
    .map(obj => obj.id);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [deploymentClicked, setDeploymentClicked] = useState(null);

  useEffect(() => {
    ReactGA.pageview("/projects/deployments/overview");
  }, []);

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
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      render: (text, record) => {
        switch (text) {
          case "image":
            return "Docker";
          default:
            return "Custom Code";
        }
      }
    },
    {
      title: "Replicas",
      dataIndex: "replicas",
      key: "replicas"
    },
    {
      title: "Private URL",
      key: "url",
      render: (_, record) => `${record.id}.${projectID}.svc.cluster.local`
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
      upstreams: obj.upstreams
    };
  });

  const deploymentClickedInfo = deploymentClicked
    ? data.find(
      obj =>
        obj.id === deploymentClicked.serviceId &&
        obj.version === deploymentClicked.version
    )
    : undefined;

  const handleEditDeploymentClick = (serviceId, version) => {
    setDeploymentClicked({ serviceId, version });
    setModalVisibility(true);
  };

  const handleSubmit = (type, values) => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
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
              imagePullPolicy: values.imagePullPolicy
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
      client.deployments
        .setDeploymentConfig(projectID, serviceId, values.version, config)
        .then(() => {
          if (type === "add") {
            const newDeployments = [...deployments, config];
            setProjectConfig(
              projectID,
              "modules.deployments.services",
              newDeployments
            );
          } else {
            const newDeployments = deployments.map(obj => {
              if (obj.id === config.id && obj.version === config.version) return config;
              return obj;
            });
            setProjectConfig(
              projectID,
              "modules.deployments.services",
              newDeployments
            );
          }
          resolve();
        })
        .catch(ex => reject(ex))
        .finally(() => dispatch(decrement("pendingRequests")));
    });
  };

  const handleDelete = (serviceId, version) => {
    dispatch(increment("pendingRequests"));
    client.deployments
      .deleteDeploymentConfig(projectID, serviceId, version)
      .then(() => {
        const newDeployments = deployments.filter(obj => !(obj.id === serviceId && obj.version === version));
        setProjectConfig(
          projectID,
          "modules.deployments.services",
          newDeployments
        );
        notify("success", "Success", "Successfully deleted deployment config");
      })
      .catch(ex => notify("error", "Error deleting deployment", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleCancel = () => {
    setModalVisibility(false);
    setDeploymentClicked(null);
  };

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
                  Deploy any docker containers to cloud easily in no time. Space
                  Galaxy deploys your docker containers in a secure service mesh
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
              <div style={{ marginBottom: 47 }}>
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
              <Table bordered={true} columns={tableColumns} dataSource={data} rowKey={(record) => record.id + record.version} />
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
