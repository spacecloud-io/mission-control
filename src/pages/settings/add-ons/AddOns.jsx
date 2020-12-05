import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import SettingsTabs from "../../../components/settings/settings-tabs/SettingsTabs";
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import { Row, Col, Divider, Button, Badge, Popconfirm, Card } from "antd";
import { projectModules } from "../../../constants";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { loadAddonConfig, saveAddonConfig, loadAddonConnState } from "../../../operations/addons";

const AddOns = () => {

  const { projectID } = useParams();
  const history = useHistory();

  const { rabbitmq, redis } = useSelector(state => state.addonsConfig)
  const connState = useSelector(state => state.addonsConnState)

  useEffect(() => {
    incrementPendingRequests()
    Promise.all([
      loadAddonConfig("rabbitmq"),
      loadAddonConfig("redis")
    ])
      .catch(ex => notify("error", "Error loading add-ons config", ex))
      .finally(() => decrementPendingRequests())
  }, [])

  useEffect(() => {
    if (rabbitmq.enabled) {
      incrementPendingRequests()
      loadAddonConnState("rabbitmq")
        .catch(ex => notify("error", "Error loading RabbitMQ connection status", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [rabbitmq.enabled])

  useEffect(() => {
    if (redis.enabled) {
      incrementPendingRequests()
      loadAddonConnState("redis")
        .catch(ex => notify("error", "Error loading Redis connection status", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [redis.enabled])

  // Handlers
  const handleDisableAddonConfig = (type) => {
    incrementPendingRequests()
    saveAddonConfig(type, { enabled: false })
      .then(() => notify("success", "Success", "Disabled add-on successfully"))
      .catch(ex => notify("error", "Error disabling add-on", ex))
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
            <Col sm={24} lg={16} xl={12}>
              <h2>Rabbit MQ</h2>
              <p>A global Rabbit MQ cluster managed by Space Cloud</p>
              {rabbitmq && rabbitmq.enabled ?
                <Card bordered style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={connState.rabbitmq ? "green" : "red"} text={connState.rabbitmq ? "Connected" : "Disconnected"} /> <br />
                    <b style={{ marginRight: 8 }}>CPU:</b> {rabbitmq.resources.cpu} <br />
                    <b style={{ marginRight: 8 }}>RAM:</b> {rabbitmq.resources.memory} MBs <br />
                    <b style={{ marginRight: 8 }}>High availability:</b> {rabbitmq.options.highAvailability ? <span>On <CheckOutlined style={{ color: "green" }} /></span> : <span>Off <CloseOutlined style={{ color: "red " }} /></span>} <br />
                  </p>
                  <Button style={{ marginRight: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/configure/rabbit-mq`)}>Edit config</Button>
                  <Popconfirm
                    title="Are you sure you want to disable?"
                    onConfirm={() => handleDisableAddonConfig("rabbitmq")}
                  >
                    <Button danger>Disable Rabbit MQ</Button>
                  </Popconfirm>
                </Card> :
                <Button onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/configure/rabbit-mq`)}>Enable Rabbit MQ</Button>
              }
              <Divider />
              <h2>Redis</h2>
              <p>A global Redis instance managed by Space Cloud</p>
              {redis && redis.enabled ?
                <Card bordered style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={connState.redis ? "green" : "red"} text={connState.redis ? "Connected" : "Disconnected"} /> <br />
                    <b style={{ marginRight: 8 }}>CPU:</b> {redis.resources.cpu} <br />
                    <b style={{ marginRight: 8 }}>RAM:</b> {redis.resources.memory} MBs <br />
                  </p>
                  <Button style={{ marginRight: 16 }} onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/configure/redis`)}>Edit config</Button>
                  <Popconfirm
                    title="Are you sure you want to disable?"
                    onConfirm={() => handleDisableAddonConfig("redis")}
                  >
                    <Button danger>Disable Redis</Button>
                  </Popconfirm>
                </Card> :
                <Button onClick={() => history.push(`/mission-control/projects/${projectID}/settings/add-ons/configure/redis`)}>Enable Redis</Button>}
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
};

export default AddOns;
