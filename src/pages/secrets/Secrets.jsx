import React, { useState } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { Button, Table, Popconfirm, Empty, Input } from "antd";
import AddSecret from "../../components/secret/AddSecret";
import UpdateDockerSecret from "../../components/secret/UpdateDockerSecret";
import { getSecretType, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { notify } from "../../utils";
import { saveSecret, deleteSecret, getSecrets } from "../../operations/secrets";
import { projectModules, actionQueuedMessage } from "../../constants";
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

const Secrets = () => {
  const history = useHistory();
  const { projectID } = useParams();

  // Global state
  const secrets = useSelector(state => getSecrets(state))

  // Component state
  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [dockerSecretModalVisible, setDockerSecretModalVisible] = useState(false);
  const [secretIdClicked, setSecretIdClicked] = useState("");
  const [searchText, setSearchText] = useState('')

  const filteredSecrets = secrets.filter(secret => {
    return secret.id.toLowerCase().includes(searchText.toLowerCase())
  })

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
      dataIndex: "id",
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
      title: "Type",
      key: "type",
      render: (_, record) => getSecretType(record.type),
      filters: [
        { text: 'Environment variable', value: 'env' },
        { text: 'File secret', value: 'file' },
        { text: 'Docker secret', value: 'docker' }
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0
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
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
            <h3 style={{ margin: 'auto 0' }}>Secrets {filteredSecrets.length ? `(${filteredSecrets.length})` : ''}</h3>
            <div style={{ display: 'flex' }}>
              <Input.Search placeholder='Search by secret name' style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
              <Button style={{ marginLeft: '16px' }} onClick={() => setSecretModalVisible(true)} type="primary">Add</Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={filteredSecrets}
            bordered={true}
            onRow={(record) => { return { onClick: event => { handleSecretView(record.id) } } }}
            locale={{
              emptyText: secrets.length !== 0 ?
                <EmptySearchResults searchText={searchText} /> :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No secrets created yet. Add a secret' />
            }} />
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
