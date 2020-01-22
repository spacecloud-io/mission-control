import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Button, Table, Popconfirm } from "antd";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import AddDeploymentForm from "../../components/deployments/AddDeploymentForm";
import client from "../../client"; 
import source_code from "../../assets/source_code.svg";
import { getProjectConfig, setProjectConfig, notify } from "../../utils";
import { increment, decrement } from "automate-redux";

const Deployments = () => {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const deployments = getProjectConfig(
    projects,
    projectID,
    "modules.deployments.services",
    []
  );
  const [modalVisibility, setModalVisibility] = useState(false);
  const [deploymentClicked, setDeploymentClicked] = useState("");

  const tableColumns = [
    {
      title: "Service ID",
      dataIndex: "id",
      key: "id"
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
      render: (_, { id }) => (
        <span>
          <a onClick={() => handleEditDeploymentClick(id)}>Edit</a>
          <Popconfirm
            title={`This will remove this deployment config and stop all running instances of it. Are you sure?`}
            onConfirm={() => handleDelete(id)}
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
      serviceType: task.runtime,
      dockerImage: task.docker.image,
      registryType: "public",
      ports: task.ports,
      cpu: task.resources.cpu / 1000,
      memory: task.resources.memory,
      min: obj.scale.minReplicas,
      max: obj.scale.maxReplicas,
      replicas: obj.scale.replicas,
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
    ? data.find(obj => obj.id === deploymentClicked)
    : undefined;


    const handleEditDeploymentClick = serviceId => {
      setDeploymentClicked(serviceId);
      setModalVisibility(true);
    };
  
    const handleSubmit = (type, values) => {
      return new Promise((resolve, reject) => {
        dispatch(increment("pendingRequests"))
        let config =  {
          id: values.id,
          projectId: projectID,
          version: "v1",
          scale: {
            replicas: 0,
            minReplicas: values.min,
            maxReplicas: values.max,
            concurrency: values.concurrency
          },
          tasks: [{
            id: values.id,
            ports: values.ports,
            resources: {
              cpu: values.cpu*1000,
              memory: values.memory
            },
            docker: {
              image: values.dockerImage
            },
            env: values.env? values.env.reduce((prev, curr) => {
              return Object.assign({}, prev, {[curr.key]: curr.value})
            }, {}): {},
            runtime: values.serviceType
          }],
          whitelists: values.whitelists,
          upstreams: values.upstreams
        }
        client.deployments.setDeploymentConfig(config).then(() => {
          if (type === "add") {
            const newDeployments = [...deployments, config]
            setProjectConfig(projectID, "modules.deployments.services", newDeployments)
          } else {
            const newDeployments = deployments.map(obj => {
              if (obj.id === config.id) return config
              return obj
            })
            setProjectConfig(projectID, "modules.deployments.services", newDeployments)
          }
          resolve()
        })
        .catch(ex => reject(ex))
        .finally(() => dispatch(decrement("pendingRequests")))
      })
    };

    const handleDelete = (serviceId) => {
      dispatch(increment("pendingRequests"))
      client.deployments.deleteDeploymentConfig(projectID, serviceId, "v1").then(() => {
        const newDeployments = deployments.filter(obj => obj.id !== serviceId)
        setProjectConfig(projectID, "modules.deployments.services", newDeployments)
        notify("success", "Success", "Successfully deleted deployment config")
      }).catch(ex => notify("error", "Error deleting deployment", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
    }
  
    const handleCancel = () => {
      setModalVisibility(false);
      setDeploymentClicked("");
    };

  return (
    <React.Fragment>
      <Topbar />
      <Sidenav selectedItem="deployments" />
      <div className="page-content">
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
                Deploy your custom services easily from your laptop to cloud in
                no time. Space Galaxy deploys your services in a secure service
                mesh and provides you with a serverless experience by taking
                care of auto scaling, self healing, etc.
              </p>
              <Button
                type="primary"
                style={{ marginTop: 16 }}
                onClick={() => setModalVisibility(true)}
              >
                Deploy your first service
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
            <Table bordered={true} columns={tableColumns} dataSource={data} />
          </React.Fragment>
        )}
      </div>
      {modalVisibility && (
        <AddDeploymentForm
          visible={modalVisibility}
          initialValues={deploymentClickedInfo}
          projectId={projectID}
          handleCancel={handleCancel}
          handleSubmit={(values) => handleSubmit(deploymentClickedInfo ? "update": "add", values)}
        />
      )}
    </React.Fragment>
  );
};

export default Deployments;
