import React, { useState } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { LeftOutlined } from '@ant-design/icons';
import { Button, Table, Row, Col, Popconfirm, Card, Input, Empty } from "antd";
import AddSecretKey from "../../components/secret/AddSecretKey";
import UpdateRootPathModal from '../../components/secret/UpdateRootPathModal';
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../utils";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import './secretDetail.css';
import { saveSecretKey, deleteSecretKey, saveRootPath, getSecrets } from "../../operations/secrets";
import { projectModules, actionQueuedMessage } from "../../constants";
import Highlighter from 'react-highlight-words';
import EmptySearchResults from "../../components/utils/empty-search-results/EmptySearchResults";

const getLabelFromSecretType = type => {
  switch (type) {
    case "docker":
      return "Docker Secret";
    case "file":
      return "File Secrets";
    default:
      return "Environment Variables";
  }
};

const SecretDetails = () => {
  const history = useHistory();
  const { projectID, secretId } = useParams();

  // Global state
  const secrets = useSelector(state => getSecrets(state))

  // Component state
  const [secretKeyModalVisible, setSecretKeyModalVisible] = useState(false);
  const [secretKeyClicked, setSecretKeyClicked] = useState("");
  const [rootPathModalVisible, setRootPathModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('')

  // Derived state
  let secret = secrets.find(obj => obj.id === secretId);
  if (!secret) secret = { data: {} };
  const secretType = secret.type;
  const secretKeysData = Object.keys(secret.data).map(key => ({ name: key }));

  const filteredSecretKeys = secretKeysData.filter(secret => {
    return secret.name.toLowerCase().includes(searchText.toLowerCase())
  })

  // Handlers
  const handleClickUpdateSecretKey = name => {
    setSecretKeyClicked(name);
    setSecretKeyModalVisible(true);
  };

  const handleSetSecretKey = (key, value) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveSecretKey(projectID, secretId, key, value)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved secret key successfully");
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving secret key value", ex);
          reject();
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleDeleteSecretKey = name => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      deleteSecretKey(projectID, secretId, name)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Deleted secret key successfully");
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving secret key value", ex);
          reject();
        })
        .finally(() => decrementPendingRequests());
    });
  };

  const handleCancel = () => {
    setSecretKeyModalVisible(false);
    setSecretKeyClicked("");
  };

  const handleUpdateRootpath = (path) => {
    return new Promise((resolve, reject) => {
      incrementPendingRequests()
      saveRootPath(projectID, secretId, path)
        .then(({ queued }) => {
          notify("success", "Success", queued ? actionQueuedMessage : "Saved root path successfully");
          resolve()
        })
        .catch(ex => {
          notify("error", "Error saving root path", ex);
          reject();
        })
        .finally(() => decrementPendingRequests());
    });
  }

  const envColumns = [
    {
      title: "Environment Key",
      dataIndex: "name",
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
      title: "Actions",
      className: "column-actions",
      render: (_, record) => {
        return (
          <span>
            <a onClick={() => handleClickUpdateSecretKey(record.name)}>
              Update
            </a>
            <Popconfirm
              title={`This will delete the secret. Are you sure?`}
              onConfirm={() => handleDeleteSecretKey(record.name)}
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </span>
        );
      }
    }
  ];

  const fileColumns = [
    {
      title: "File Name",
      dataIndex: "name",
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
      title: "Actions",
      className: "column-actions",
      render: (_, record) => {
        return (
          <span>
            <a onClick={() => handleClickUpdateSecretKey(record.name)}>
              Update
            </a>
            <Popconfirm
              title={`This will delete the secret. Are you sure?`}
              onConfirm={() => handleDeleteSecretKey(record.name)}
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SECRETS} />
      <div>
        {secretKeyModalVisible && (
          <AddSecretKey
            secretType={secretType}
            initialValue={secretKeyClicked}
            handleSubmit={handleSetSecretKey}
            handleCancel={handleCancel}
          />
        )}
        <div className="page-content page-content--no-padding">
          <div
            style={{
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              height: 48,
              lineHeight: 48,
              zIndex: 98,
              display: "flex",
              alignItems: "center",
              padding: "0 16px"
            }}
          >
            <Button type="link" onClick={() => history.goBack()}>
              <LeftOutlined />
              Go back
            </Button>
            <span style={{ marginLeft: "35%" }}>{secretId}</span>
          </div>
          <br />
          <Row>
            <Col lg={{ span: 15, offset: 1 }} xs={{ span: 22, offset: 1 }}>
              {secretType === "file" && (
                <React.Fragment>
                  <h3>Secret mount location <a style={{ textDecoration: "underline", fontSize: 14 }} onClick={() => setRootPathModalVisible(true)}>(Edit)</a></h3>
                  <div className="mount-location">
                    {secret.rootPath}
                  </div>
                  {rootPathModalVisible && (
                    <UpdateRootPathModal
                      rootPath={secret.rootPath}
                      handleSubmit={handleUpdateRootpath}
                      handleCancel={() => setRootPathModalVisible(false)}
                    />
                  )}
                </React.Fragment>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '16px' }}>
                <h3 style={{ margin: 'auto 0' }}>{getLabelFromSecretType(secretType)} {secretType !== 'docker' && filteredSecretKeys.length ? `(${filteredSecretKeys.length})` : ''}</h3>
                <div style={{ display: 'flex' }}>
                  {secretType !== "docker" && (<React.Fragment>
                    <Input.Search placeholder={`Search by ${secretType} ${secretType === 'env' ? 'key' : 'name'}`} style={{ minWidth: '320px' }} allowClear={true} onChange={e => setSearchText(e.target.value)} />
                    <Button
                      style={{ marginLeft: '16px' }}
                      onClick={() => setSecretKeyModalVisible(true)}
                      type="primary"
                    >
                      Add
                  </Button>
                  </React.Fragment>
                  )}
                </div>
              </div>
              {secretType === "env" && (
                <Table
                  columns={envColumns}
                  dataSource={filteredSecretKeys}
                  bordered={true}
                  pagination={false}
                  locale={{
                    emptyText: secretKeysData.length !== 0 ?
                      <EmptySearchResults searchText={searchText} /> :
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No environment variable created yet. Add a environment variable' />
                  }}
                />
              )}
              {secretType === "file" && (
                <Table
                  columns={fileColumns}
                  dataSource={filteredSecretKeys}
                  bordered={true}
                  pagination={false}
                  locale={{
                    emptyText: secretKeysData.length !== 0 ?
                      <EmptySearchResults searchText={searchText} /> :
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='No file secret created yet. Add a file secret' />
                  }}
                />
              )}
              {secretType === "docker" && (
                <Card style={{ width: "145%" }}>
                  <p>
                    <span style={{ fontWeight: "bold", fontSize: 14 }}>
                      Username
                    </span>
                    <span style={{ marginLeft: 48, fontSize: 14 }}>
                      {secret.data.username}
                    </span>
                  </p>
                  <p>
                    <span style={{ fontWeight: "bold", fontSize: 14 }}>
                      Registry URL
                    </span>
                    <span style={{ marginLeft: 30, fontSize: 14 }}>
                      {secret.data.url}
                    </span>
                  </p>
                </Card>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default SecretDetails;
