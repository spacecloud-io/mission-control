import React, { useState,useEffect } from "react";
import Sidenav from "../../components/sidenav/Sidenav";
import Topbar from "../../components/topbar/Topbar";
import { LeftOutlined } from '@ant-design/icons';
import { Button, Table, Row, Col, Popconfirm, Card } from "antd";
import ReactGA from 'react-ga';
import AddSecretKey from "../../components/secret/AddSecretKey";
import UpdateRootPathModal from '../../components/secret/UpdateRootPathModal';
import { getProjectConfig, setProjectConfig, notify } from "../../utils";
import { useHistory, useParams } from "react-router-dom";
import client from "../../client";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "automate-redux";
import './secretDetail.css';

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
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const secrets = getProjectConfig(projects, projectID, "modules.secrets", []);
  let secret = secrets.find(obj => obj.id === secretId);
  if (!secret) secret = { data: {} };
  const secretType = secret.type;
  const secretKeysData = Object.keys(secret.data).map(key => ({ name: key }));
  const [secretKeyModalVisible, setSecretKeyModalVisible] = useState(false);
  const [secretKeyClicked, setSecretKeyClicked] = useState("");
  const [rootPathModalVisible, setRootPathModalVisible] = useState(false);

  useEffect(() => {
		ReactGA.pageview("/projects/secrets/secretDetails");
  }, [])
  
  const handleClickUpdateSecretKey = name => {
    setSecretKeyClicked(name);
    setSecretKeyModalVisible(true);
  };

  const handleSetSecretKey = (key, value) => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
      client.secrets
        .setSecretKey(projectID, secretId, key, value)
        .then(() => {
          const newSecrets = secrets.map(obj => {
            if (obj.id !== secretId) return obj;
            const newData = Object.assign({}, secret.data, { [key]: value });
            return Object.assign({}, secret, { data: newData });
          });
          setProjectConfig(projectID, "modules.secrets", newSecrets);
          resolve();
        })
        .catch(ex => {
          notify("error", "Error setting secret value", ex);
          reject();
        })
        .finally(() => dispatch(decrement("pendingRequests")));
    });
  };

  const handleDeleteSecretKey = name => {
    dispatch(increment("pendingRequests"));
    client.secrets.deleteSecretKey(projectID, secretId, name).then(() => {
      const newSecrets = secrets.map(obj => {
        if (obj.id !== secretId) return obj;
        const newData = Object.assign({}, secret.data);
        delete newData[name]
        return Object.assign({}, secret, { data: newData });
      });
      setProjectConfig(projectID, "modules.secrets", newSecrets);
    }).catch(ex => notify("error", "Error deleting secret value", ex))
    .finally(() => dispatch(decrement("pendingRequests")));
  };

  const handleCancel = () => {
    setSecretKeyModalVisible(false);
    setSecretKeyClicked("");
  };

  const handleUpdateRootpath = (path) => {
    return new Promise((resolve, reject) => {
      dispatch(increment("pendingRequests"));
      client.secrets.setRootPath(projectID, secretId, { rootPath : path}).then(() => {
        const updatedSecret = secrets.map(obj => {
          if (obj.id !==  secretId) return obj;
          const newData = Object.assign({}, { rootPath: path });
          return Object.assign({}, obj, newData);
        });
        setProjectConfig(projectID, `modules.secrets`, updatedSecret);
        notify("success", "Success", "Saved root path successfully")
        resolve();
      }).catch((ex) => {
        notify("error", "Error in saving root path", ex.toString());
        reject(ex)
      }).finally(() => dispatch(decrement("pendingRequests")));
    })
  }

  const envColumns = [
    {
      title: "Environment Key",
      dataIndex: "name"
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
      dataIndex: "name"
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
      <Sidenav selectedItem="secrets" />
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
            <Col lg={{ span: 15, offset: 1 }} xs={{ span:22, offset:1 }}>
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
              <h3 style={{ display: "flex", justifyContent: "space-between" }}>
                {getLabelFromSecretType(secretType)}
                {secretType !== "docker" && (
                  <Button
                    onClick={() => setSecretKeyModalVisible(true)}
                    type="primary"
                  >
                    Add
                  </Button>
                )}
              </h3>
              {secretType === "env" && (
                <Table
                  columns={envColumns}
                  dataSource={secretKeysData}
                  bordered={true}
                  pagination={false}
                />
              )}
              {secretType === "file" && (
                <Table
                  columns={fileColumns}
                  dataSource={secretKeysData}
                  bordered={true}
                  pagination={false}
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
