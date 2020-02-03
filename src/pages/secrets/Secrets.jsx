import React, { useState } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import security from "../../assets/security.svg";
import { Button, Table, Popconfirm } from "antd";
import AddSecret from "../../components/secret/AddSecret";
import UpdateDockerSecret from "../../components/secret/UpdateDockerSecret";
import { getSecretType, getProjectConfig, setProjectConfig } from "../../utils";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement } from "automate-redux";
import client from "../../client";
import { notify } from "../../utils";

const Secrets = () => {
  const history = useHistory();
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const secrets = getProjectConfig(projects, projectID, "modules.secrets", []);
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [dockerSecretModalVisible, setDockerSecretModalVisible] = useState(
    false
  );
  const [secretNameClicked, setSecretNameClicked] = useState("");

  const handleAddSecret = (secretConfig) => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
      client.secrets
        .addSecret(projectID, secretConfig)
        .then(() => {
          const newSecrets = [...secrets.filter(obj => obj.name !== secretConfig.name), secretConfig];
          setProjectConfig(projectID, "modules.secrets", newSecrets);
          resolve();
        })
        .catch(ex => {
          notify("error", "Error adding secret", ex);
          reject();
        })
        .finally(() => dispatch(decrement("pendingRequests")));
    });
  };

  const handleDeleteSecret = secretName => {
    dispatch(increment("pendingRequests"));
    client.secrets
      .deleteSecret(projectID, secretName)
      .then(() => {
        const newSecrets = secrets.filter(obj => obj.name !== secretName);
        setProjectConfig(projectID, "modules.secrets", newSecrets);
      })
      .catch(ex => notify("error", "Error adding secret", ex))
      .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleSecretView = name => {
    history.push(`/mission-control/projects/${projectID}/secrets/${name}`);
  };

  const handleClickUpdateDockerSecret = name => {
    setSecretNameClicked(name);
    setDockerSecretModalVisible(true);
  };

  const handleDockerModalCancel = () => {
    setDockerSecretModalVisible(false);
    setSecretNameClicked("");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name"
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => getSecretType(record.type)
    },
    {
      title: "Actions",
      className: "column-actions",
      render: (_, record) => {
        return (
          <span>
            {record.type === "docker" && (
              <a onClick={() => handleClickUpdateDockerSecret(record.name)}>
                Update
              </a>
            )}
            {record.type !== "docker" && (
              <a onClick={() => handleSecretView(record.name)}>View</a>
            )}
            <Popconfirm
              title={`This will delete the secrets. Are you sure?`}
              onConfirm={() => handleDeleteSecret(record.name)}
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </span>
        );
      }
    }
  ];

  const EmptyState = () => {
    return (
      <div style={{ marginTop: 24 }}>
        <div className="rule-editor">
          <div className="panel">
            <img src={security} style={{ maxWidth: "500px" }} />
            <p
              className="panel__description"
              style={{ marginTop: 32, marginBottom: 0 }}
            >
              Store private information required by your deployments in a
              secure, encrypted format. Space Cloud takes care of all encryption
              and decryption.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const handleSecretModalCancel = () => {
    setSecretModalVisible(false);
  };

  return (
    <div>
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem="secrets" />
        <div className="page-content">
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>
            Secrets{" "}
            <Button onClick={() => setSecretModalVisible(true)} type="primary">
              Add
            </Button>
          </h3>
          {secrets.length > 0 && (
            <Table columns={columns} dataSource={secrets} bordered={true} />
          )}
          {secrets.length === 0 && <EmptyState />}
          {secretModalVisible && (
            <AddSecret
              handleCancel={handleSecretModalCancel}
              handleSubmit={handleAddSecret}
            />
          )}
          {dockerSecretModalVisible && (
            <UpdateDockerSecret
              handleCancel={handleDockerModalCancel}
              handleSubmit={handleAddSecret}
              initialValue={secretNameClicked}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Secrets;
