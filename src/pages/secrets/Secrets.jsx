import React, { useState, useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { Button, Table, Popconfirm, Empty } from "antd";
import ReactGA from 'react-ga';
import AddSecret from "../../components/secret/AddSecret";
import UpdateDockerSecret from "../../components/secret/UpdateDockerSecret";
import { getSecretType, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { notify } from "../../utils";
import { saveSecret, deleteSecret, getSecrets } from "../../operations/secrets";
import { projectModules, actionQueuedMessage } from "../../constants";

const Secrets = () => {
  const history = useHistory();
  const { projectID } = useParams();

  // Global state
  const secrets = useSelector(state => getSecrets(state))

  // Component state
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [dockerSecretModalVisible, setDockerSecretModalVisible] = useState(false);
  const [secretIdClicked, setSecretIdClicked] = useState("");

  useEffect(() => {
    ReactGA.pageview("/projects/secrets");
  }, [])

  // Handlers
  const handleAddSecret = (secretConfig) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveSecret(projectID, secretConfig)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved secret successfully")
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
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Deleted secret successfully"))
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

  const handleSecretModalCancel = () => {
    setSecretModalVisible(false);
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

  return (
    <div>
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem={projectModules.SECRETS} />
        <div className="page-content">
          <h3 style={{ display: "flex", justifyContent: "space-between" }}>
            Secrets{" "}
            <Button onClick={() => setSecretModalVisible(true)} type="primary">
              Add
            </Button>
          </h3>
          <Table
            columns={columns}
            dataSource={secrets}
            bordered={true}
            onRow={(record) => { return { onClick: event => { handleSecretView(record.id) } } }}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No secrets created yet. Add a secret' /> }} />
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
