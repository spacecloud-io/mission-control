import React from "react";
import "./add-deployment-form.css";
import FormItemLabel from "../form-item-label/FormItemLabel";
import RadioCard from "../radio-card/RadioCard";
import docker from "../../assets/docker.png";
import python from "../../assets/python.png";
import js from "../../assets/js.png";
import go from "../../assets/go.png";
import { notify } from "../../utils";

import {
  Modal,
  Form,
  Radio,
  Input,
  Row,
  Col,
  Select,
  Button,
  Icon,
  Collapse,
  InputNumber
} from "antd";
const { Option } = Select;
const { Panel } = Collapse;

let ports = 1;
let env = 0;
let white = 1;
let upstreams = 1;
const AddDeploymentForm = props => {
  const { initialValues, projectId } = props;
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        delete values["keys"];
        delete values["envKeys"];
        delete values["whiteKeys"];
        delete values["upstreamsKeys"];
        values.cpu = Number(values.cpu);
        values.memory = Number(values.memory);
        values.min = Number(values.min);
        values.max = Number(values.max);
        values.serviceType = initialValues ? initialValues.serviceType : "image"
        props
          .handleSubmit(values)
          .then(() => {
            notify(
              "success",
              "Success",
              "Saved deployment config successfully"
            );
            props.handleCancel();
          })
          .catch(ex => notify("error", "Error saving config", ex.toString()));
      }
    });
  };

  // PORTS
  const remove = k => {
    const keys = getFieldValue("keys");
    if (keys.length === 1) {
      return;
    }

    setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  const add = () => {
    const keys = getFieldValue("keys");
    const nextKeys = keys.concat(ports++);
    setFieldsValue({
      keys: nextKeys
    });
  };

  getFieldDecorator("keys", {
    initialValue: initialValues
      ? initialValues.ports.map((_, index) => index)
      : [0]
  });
  const keys = getFieldValue("keys");
  const formItemsPorts = keys.map((k, index) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }}>
          {getFieldDecorator(`ports[${k}].protocol`, {
            initialValue:
              initialValues && initialValues.ports[k]
                ? initialValues.ports[k].protocol
                : "http"
          })(
            <Select style={{ width: 120 }}>
              <Option value="http">HTTP</Option>
            </Select>
          )}
        </Form.Item>
        <br />
        {index === keys.length - 1 && (
          <Button onClick={() => add()} style={{ marginTop: -10 }}>
            Add another port
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginLeft: -40, marginRight: 30 }}>
          {getFieldDecorator(`ports[${k}].port`, {
            rules: [
              {
                required: true,
                message: "Please fill this field before adding!"
              }
            ],
            initialValue:
              initialValues && initialValues.ports[k]
                ? initialValues.ports[k].port
                : ""
          })(
            <InputNumber
              placeholder="Port (Example: 8080)"
              style={{ width: 280 }}
            />
          )}
        </Form.Item>
      </Col>
      <Col span={5}>
        {index > 0 && (
          <Button onClick={() => remove(k)}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  // ENVIRONMENT VARIABLES
  const envRemove = k => {
    const envKeys = getFieldValue("envKeys");
    setFieldsValue({
      envKeys: envKeys.filter(key => key !== k)
    });
  };

  const envAdd = () => {
    const envKeys = getFieldValue("envKeys");
    const nextKeys = envKeys.concat(env++);
    setFieldsValue({
      envKeys: nextKeys
    });
  };

  getFieldDecorator("envKeys", {
    initialValue: initialValues
      ? initialValues.env.map((_, index) => index)
      : []
  });
  const envKeys = getFieldValue("envKeys");
  const formItemsEnv = envKeys.map(k => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item style={{ display: "inline-block" }}>
          {getFieldDecorator(`env[${k}].key`, {
            rules: [{ required: true, message: "Please enter key!" }],
            initialValue:
              initialValues && initialValues.env[k]
                ? initialValues.env[k].key
                : ""
          })(<Input style={{ width: 120 }} placeholder="Key" />)}
        </Form.Item>
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30 }}>
          {getFieldDecorator(`env[${k}].value`, {
            rules: [
              {
                required: true,
                message: "Please enter value before adding another!"
              }
            ],
            initialValue:
              initialValues && initialValues.env[k]
                ? initialValues.env[k].value
                : ""
          })(
            <Input
              style={{ width: 280, marginLeft: -40, marginRight: 30 }}
              placeholder="Value"
            />
          )}
        </Form.Item>
      </Col>
      <Col span={5}>
        <Button onClick={() => envRemove(k)}>
          <Icon type="delete" />
        </Button>
      </Col>
    </Row>
  ));

  //WHITELIST
  const whiteRemove = k => {
    const whiteKeys = getFieldValue("whiteKeys");
    if (whiteKeys.length === 1) {
      return;
    }

    setFieldsValue({
      whiteKeys: whiteKeys.filter(key => key !== k)
    });
  };

  const whiteAdd = () => {
    const whiteKeys = getFieldValue("whiteKeys");
    const nextKeys = whiteKeys.concat(white++);
    setFieldsValue({
      whiteKeys: nextKeys
    });
  };

  getFieldDecorator("whiteKeys", {
    initialValue: initialValues
      ? initialValues.whitelists.map((_, index) => index)
      : [0]
  });
  const whiteKeys = getFieldValue("whiteKeys");
  const formItemsWhite = whiteKeys.map((k, index) => (
    <Row
      key={k}
      className={index === whiteKeys.length - 1 ? "bottom-spacing" : ""}
    >
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }}>
          {getFieldDecorator(`whitelists[${k}].projectId`, {
            rules: [
              {
                required: true,
                message: "Please fill the project id of the service!"
              }
            ],
            initialValue:
              initialValues && initialValues.whitelists[k]
                ? initialValues.whitelists[k].projectId
                : projectId
          })(
            <Input
              style={{ width: 230 }}
              placeholder="Project ID ( * to select all )"
            />
          )}
        </Form.Item>
        <Icon
          type="right"
          style={{ fontSize: 12, marginLeft: 16, marginTop: 8 }}
        />
        <br />
        {index === whiteKeys.length - 1 && (
          <Button onClick={() => whiteAdd()} style={{ marginTop: -10 }}>
            Add another whitelist
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30 }}>
          {getFieldDecorator(`whitelists[${k}].service`, {
            rules: [
              {
                required: true,
                message: "Please fill the name of the service!"
              }
            ],
            initialValue:
              initialValues && initialValues.whitelists[k]
                ? initialValues.whitelists[k].service
                : "*"
          })(
            <Input
              style={{ width: 230 }}
              placeholder="Service Name ( * to select all )"
            />
          )}
        </Form.Item>
      </Col>
      <Col span={3}>
        <Button onClick={() => whiteRemove(k)}>
          <Icon type="delete" />
        </Button>
      </Col>
    </Row>
  ));

  //UPSTREAMS
  const upstreamsRemove = k => {
    const upstreamsKeys = getFieldValue("upstreamsKeys");
    if (upstreamsKeys.length === 1) {
      return;
    }

    setFieldsValue({
      upstreamsKeys: upstreamsKeys.filter(key => key !== k)
    });
  };

  const upstreamsAdd = () => {
    const upstreamsKeys = getFieldValue("upstreamsKeys");
    const nextKeys = upstreamsKeys.concat(upstreams++);
    setFieldsValue({
      upstreamsKeys: nextKeys
    });
  };

  getFieldDecorator("upstreamsKeys", {
    initialValue: initialValues
      ? initialValues.upstreams.map((_, index) => index)
      : [0]
  });
  const upstreamsKeys = getFieldValue("upstreamsKeys");
  const formItemsUpstreams = upstreamsKeys.map((k, index) => (
    <Row
      key={k}
      className={index === upstreamsKeys.length - 1 ? "bottom-spacing" : ""}
    >
      <Col span={10}>
        <Form.Item style={{ display: "inline-block" }}>
          {getFieldDecorator(`upstreams[${k}].projectId`, {
            rules: [
              {
                required: true,
                message: "Please fill the project id of the upstream service!"
              }
            ],
            initialValue:
              initialValues && initialValues.upstreams[k]
                ? initialValues.upstreams[k].projectId
                : projectId
          })(
            <Input
              style={{ width: 230 }}
              placeholder="Project ID ( * to select all )"
            />
          )}
        </Form.Item>
        <Icon
          type="right"
          style={{ fontSize: 12, marginLeft: 16, marginTop: 8 }}
        />
        <br />
        {index === upstreamsKeys.length - 1 && (
          <Button
            onClick={() => upstreamsAdd(index)}
            style={{ marginTop: -10 }}
          >
            Add another upstream service
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item style={{ marginRight: 30 }}>
          {getFieldDecorator(`upstreams[${k}].service`, {
            rules: [
              {
                required: true,
                message: "Please fill the name of the upstream service!"
              }
            ],
            initialValue:
              initialValues && initialValues.upstreams[k]
                ? initialValues.upstreams[k].service
                : "*"
          })(
            <Input
              style={{ width: 230 }}
              placeholder="Service Name ( * to select all )"
            />
          )}
        </Form.Item>
      </Col>
      <Col span={5}>
        <Button onClick={() => upstreamsRemove(k)}>
          <Icon type="delete" />
        </Button>
      </Col>
    </Row>
  ));

  const modalProps = {
    className: "edit-item-modal",
    visible: props.visible,
    width: 720,
    okText: initialValues ? "Save" : "Deploy",
    title: initialValues ? "Update deloyment config" : "Deploy Service",
    onOk: handleSubmitClick,
    onCancel: props.handleCancel,
    footer:
      initialValues || getFieldValue("serviceType") === "image"
        ? undefined
        : null
  };

  return (
    <div>
      <Modal {...modalProps}>
        <Form layout="vertical" onSubmit={handleSubmitClick}>
          {initialValues === undefined && (
            <React.Fragment>
              <FormItemLabel name="Types of service" />
              <Form.Item>
                {getFieldDecorator("serviceType", {
                  rules: [
                    { required: true, message: "Please select a service!" }
                  ],
                  initialValue: ""
                })(
                  <Radio.Group>
                    <Row>
                      <Col span={12}>
                        <RadioCard value="code" layout="card">
                          <div>
                            <div className="title">Non Dockerized</div>
                            <p className="description">
                              Space cloud will build and run your app inside
                              docker containers
                            </p>
                            <img
                              src={python}
                              className="icon"
                              alt="python.png"
                            />
                            <img src={js} className="icon" alt="js.png" />
                            <img src={go} className="icon" alt="go.png" />
                          </div>
                        </RadioCard>
                      </Col>
                      <Col span={12}>
                        <RadioCard value="image" layout="card">
                          <div className="title">
                            <div>Dockerized</div>
                            <p className="description">
                              Space cloud will directly the container image you
                              provide
                            </p>
                            <img
                              src={docker}
                              className="icon"
                              alt="docker.png"
                            />
                          </div>
                        </RadioCard>
                      </Col>
                    </Row>
                  </Radio.Group>
                )}
              </Form.Item>
            </React.Fragment>
          )}
          <br />
          {(initialValues !== undefined ||
            getFieldValue("serviceType") === "image") && (
            <React.Fragment>
              <FormItemLabel name="Service ID" />
              <Form.Item>
                {getFieldDecorator("id", {
                  rules: [
                    { required: true, message: "Please name your service!" }
                  ],
                  initialValue: initialValues ? initialValues.id : ""
                })(
                  <Input
                    placeholder="Unique name for your service"
                    style={{ width: 288 }}
                    disabled={initialValues ? true : false}
                  />
                )}
              </Form.Item>
              <FormItemLabel name="Docker container" />
              <Form.Item>
                {getFieldDecorator("dockerImage", {
                  rules: [
                    {
                      required: true,
                      message: "Please input docker container!"
                    }
                  ],
                  initialValue: initialValues ? initialValues.dockerImage : ""
                })(<Input placeholder="eg: spaceuptech/space-cloud:v0.15.0" />)}
              </Form.Item>
              <FormItemLabel name="Docker registry type" />
              <Form.Item>
                {getFieldDecorator("registryType", {
                  initialValue: "public"
                })(
                  <Radio.Group>
                    <Radio value="public">Public Registry</Radio>
                    <Radio value="private">Private Registry</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
              <React.Fragment>
                {getFieldValue("registryType") === "private" && (
                  <React.Fragment>
                    <FormItemLabel
                      name="Docker secret"
                      description="Docker secret for authentication to pull private Docker images"
                    />
                    <Form.Item>
                      {getFieldDecorator("docker_secret", {
                        rules: [
                          {
                            required: true,
                            message: "Please input docker secret!"
                          }
                        ]
                      })(
                        <Input placeholder="eg: spaceuptech/space-cloud:v0.15.0" />
                      )}
                    </Form.Item>
                  </React.Fragment>
                )}
              </React.Fragment>
              <FormItemLabel name="Ports" />
              <React.Fragment>{formItemsPorts}</React.Fragment>
              <Collapse className="deployment-collapse" bordered={false}>
                <Panel header="Advanced" key="1">
                  <FormItemLabel
                    name="Resources"
                    description="The resources to provide to each instance of the service"
                  />
                  <Form.Item>
                    {getFieldDecorator("cpu", {
                      initialValue: initialValues ? initialValues.cpu : 0.1
                    })(<Input addonBefore="vCPUs" style={{ width: 147 }} />)}
                    {getFieldDecorator("memory", {
                      initialValue: initialValues ? initialValues.memory : 100
                    })(
                      <Input
                        addonBefore="Memory (in MBs)"
                        style={{ width: 240, marginLeft: 35 }}
                      />
                    )}
                  </Form.Item>
                  <FormItemLabel
                    name="Auto scaling"
                    description="Auto scale your container instances between min and max replicas based on the number of requests"
                  />
                  <Form.Item>
                    {getFieldDecorator("min", {
                      initialValue: initialValues ? initialValues.min : 0
                    })(
                      <Input addonBefore="Min" style={{ width: 147 }} min={1} />
                    )}
                    {getFieldDecorator("max", {
                      initialValue: initialValues ? initialValues.max : 100
                    })(
                      <Input
                        addonBefore="Max"
                        style={{ width: 147, marginLeft: 35 }}
                        min={1}
                      />
                    )}
                  </Form.Item>
                  <FormItemLabel
                    name="Concurrency"
                    description="Number of requests that your single instance can handle parallely"
                  />
                  <Form.Item>
                    {getFieldDecorator("concurrency", {
                      initialValue: initialValues
                        ? initialValues.concurrency
                        : 50
                    })(<InputNumber style={{ width: 160 }} min={1} />)}
                  </Form.Item>
                  <FormItemLabel name="Environment variables" />
                  {formItemsEnv}
                  <Button onClick={() => envAdd()} style={{ marginBottom: 20 }}>
                    {envKeys.length === 0
                      ? "Add an environment variable"
                      : "Add another environment variable"}
                  </Button>
                  <FormItemLabel name="Secrets" />
                  {/* <Form.Item>
                    {getFieldDecorator("secrets", {
                      initialValue: "1"
                    })(
                      <Select
                        placeholder="Select secrets to be applied"
                        style={{ width: 410 }}
                      >
                        <Option value="1">Secret 1</Option>
                      </Select>
                    )}
                  </Form.Item> */}
                  <FormItemLabel
                    name="Whitelists"
                    description="Only those services that are whitelisted can access you"
                  />
                  {formItemsWhite}
                  <FormItemLabel
                    name="Upstreams"
                    description="The upstream servces that you want to access"
                  />
                  {formItemsUpstreams}
                </Panel>
              </Collapse>
            </React.Fragment>
          )}
        </Form>
        {getFieldValue("serviceType") === "code" && (
          <div style={{ fontSize: 14, fontWeight: 500, marginRight: 180 }}>
            <a style={{ color: "#58B3FF" }}>Follow the instructions</a> here to
            deploy your non dockerized services from your laptop to Space Cloud.
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Form.create({})(AddDeploymentForm);
