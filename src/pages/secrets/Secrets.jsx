import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import security from "../../assets/security.svg";
import { Button, Table, Popconfirm } from "antd";
import ReactGA from 'react-ga';
import AddSecret from "../../components/secret/AddSecret";
import UpdateDockerSecret from "../../components/secret/UpdateDockerSecret";
import { getSecretType, getProjectConfig, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { notify } from "../../utils";
import { setSecret, deleteSecret } from "../../operations/secrets";

const Secrets = () => {
  const history = useHistory();
  const { projectID } = useParams();
  const projects = useSelector(state => state.projects);
  const secrets = getProjectConfig(projects, projectID, "modules.secrets", []);
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [dockerSecretModalVisible, setDockerSecretModalVisible] = useState(
    false
  );
  const [secretIdClicked, setSecretIdClicked] = useState("");

  useEffect(() => {
    ReactGA.pageview("/projects/secrets");
  }, [])

  const handleAddSecret = (secretConfig) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      setSecret(projectID, secretConfig)
        .then(() => {
          notify("success", "Success", "Saved secret successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving secret", ex);
          reject();
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleDeleteSecret = secretId => {
    incrementPendingRequests()
    deleteSecret(projectID, secretId)
      .then(() => notify("success", "Success", "Deleted secret successfully"))
      .catch(ex => notify("error", "Error deleting secret", ex))
      .finally(() => decrementPendingRequests());
  };

  const handleSecretView = secretId => {
    history.push(`/mission-control/projects/${projectID}/secrets/${secretId}`);
  };

  const handleClickUpdateDockerSecret = id => {
    setSecretIdClicked(id);
    setDockerSecretModalVisible(true);
  };

  const handleDockerModalCancel = () => {
    setDockerSecretModalVisible(false);
    setSecretIdClicked("");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "id"
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
          <span style={{ display: "flex", justifyContent: "inline" }}>
            {record.type === "docker" && (
              <a onClick={(e) => {
                e.stopPropagation()
                handleClickUpdateDockerSecret(record.id)
              }}>
                Update
              </a>
            )}
            {record.type !== "docker" && (
              <a onClick={(e) => {
                e.stopPropagation()
                handleSecretView(record.id)
              }}>View</a>
            )}
            <div onClick={e => e.stopPropagation()}>
              <Popconfirm
                title={`This will delete the secrets. Are you sure?`}
                onConfirm={() => handleDeleteSecret(record.id)}
              >
                <a style={{ color: "red" }}>Delete</a>
              </Popconfirm>
            </div>
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
            <Table columns={columns} dataSource={secrets} bordered={true} onRow={(record) => { return { onClick: event => { handleSecretView(record.id) } } }} />
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
              initialValue={secretIdClicked}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Secrets;
