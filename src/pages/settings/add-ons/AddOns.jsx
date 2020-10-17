import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import ReactGA from "react-ga";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import LetsEncryptEmail from "../../../components/settings/cluster/LetsEncryptEmail";
import Telemetry from "../../../components/settings/cluster/Telemetry";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { Row, Col, Divider, Button, Badge, Popconfirm } from "antd";
import { projectModules } from "../../../constants";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { loadAddonConfig, saveAddonConfig } from "../../../operations/addons";

const AddOns = () => {

  useEffect(() => {
    ReactGA.pageview("/projects/settings/add-ons");
  }, []);

  useEffect(() => {
    incrementPendingRequests()
    Promise.all([
      loadAddonConfig("rabbitmq"),
      loadAddonConfig("redis")
    ])
    .catch(ex => notify("error", "Error", ex))
    .finally(() => decrementPendingRequests())
  }, [])

  const { projectID } = useParams();
  const history = useHistory();

  const { rabbitmq, redis } = useSelector(state => state.addonsConfig)
  const connState = useSelector(state => state.addonsConnState)

  // Handlers
  const handleDisableAddonConfig = (type) => {
    incrementPendingRequests()
    saveAddonConfig(type, { enabled: false })
    .then(() => notify("success", "Success", "Addon disabled successfully"))
    .catch(ex => notify("error", "Error", ex))
    .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SETTINGS} />
      <ProjectPageLayout>
        <SettingsTabs activeKey="add-ons" projectID={projectID} />
        <Content>
          <Row>
            <Col lg={{ span: 12 }}>
              <h2>Rabbit MQ</h2>
              <p>A global Rabbit MQ cluster managed by Space Cloud</p>
              {rabbitmq && rabbitmq.enabled ?
                <div className="config-card">
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={connState.rabbitmq ? "green" : "red"} text={connState.rabbitmq ? "Connected" : "Disconnected"} /> <br />
                    <b style={{ marginRight: 8 }}>CPU:</b> {rabbitmq.resources.cpu} <br />
                    <b style={{ marginRight: 8 }}>RAM:</b> {rabbitmq.resources.memory} GB <br />
                    <b style={{ marginRight: 8 }}>High availability:</b> {rabbitmq.options.highAvailability ? <span>On <CheckOutlined style={{ color: "green" }} /></span> : <span>Off <CloseOutlined style={{ color: "red " }}/></span>} <br />
                  </p>
                  <Button style={{ marginRight: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/rabbit-mq/config`)}>Edit config</Button>
                  <Popconfirm
                   title="Are you sure you want to disable?"
                   onConfirm={() => handleDisableAddonConfig("rabbitmq")}
                  >
                    <Button className="disable-btn">Disable Rabbit MQ</Button>
                  </Popconfirm>
                </div> :
                <Button onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/rabbit-mq/config`)}>Enable Rabbit MQ</Button>
              }
              <Divider />
              <h2>Redis</h2>
              <p>A global Redis instance managed by Space Cloud</p>
              {redis && redis.enabled  ?
                <div className="config-card">
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={connState.redis ? "green" : "red"} text={connState.redis ? "Connected" : "Disconnected"} /> <br />
                    <b style={{ marginRight: 8 }}>CPU:</b> {redis.resources.cpu} <br />
                    <b style={{ marginRight: 8 }}>RAM:</b> {redis.resources.memory} GB <br />
                  </p>
                  <Button style={{ marginRight: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/redis/config`)}>Edit config</Button>
                  <Popconfirm
                   title="Are you sure you want to disable?"
                   onConfirm={() => handleDisableAddonConfig("redis")}
                  >
                    <Button className="disable-btn">Disable Redis</Button>
                  </Popconfirm>
                </div> :
                <Button onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/redis/config`)}>Enable Redis</Button>}
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default AddOns;
