import React from "react";
import "./add-deployment-form.css";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { notify } from "../../../utils";

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
  InputNumber,
  Checkbox
} from "antd";
const { Option } = Select;
const { Panel } = Collapse;

let ports = 1;
let env = 0;
let white = 1;
let upstreams = 1;
const AddDeploymentForm = props => {
  const { initialValues, projectId, dockerSecrets, secrets } = props;
  const {
    getFieldDecorator,
    getFieldValue,
    setFieldsValue
  } = props.form;

  const handleSubmitClick = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        const gpu = values["addGPUs"] === true ? { type: values["gpuType"], value: Number(values["gpuCount"]) } : undefined
        delete values["keys"];
        delete values["envKeys"];
        delete values["whiteKeys"];
        delete values["upstreamsKeys"];
        delete values["addGPUs"];
        delete values["gpuType"];
        delete values["gpuCount"];
        values.cpu = Number(values.cpu);
        values.memory = Number(values.memory);
        values.min = Number(values.min);
        values.max = Number(values.max);
        values.concurrency = Number(values.concurrency);
        values.gpu = gpu
        values.serviceType = "image";
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

  const autoscalingModeSelect = (
    <Form.Item style={{ marginBottom: 0 }}>
      {getFieldDecorator("autoscalingMode", {
        initialValue: initialValues ? initialValues.autoscalingMode : "per-second"
      })(
        <Select
          placeholder="Select auto scaling mode"
          style={{ width: 240, top: 4 }}
        >
          <Option value="per-second">Requests per second</Option>
          <Option value="parallel">Parallel requests</Option>
        </Select>
      )}
    </Form.Item>)

  const modalProps = {
    className: "edit-item-modal",
    visible: props.visible,
    width: 720,
    okText: initialValues ? "Save" : "Deploy",
    title: initialValues ? "Update deloyment config" : "Deploy Service",
    onOk: handleSubmitClick,
    onCancel: props.handleCancel
  };

  return (
    <div>
      <Modal {...modalProps}>
        <Form layout="vertical" onSubmit={handleSubmitClick}>
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
            <FormItemLabel name="Version" />
            <Form.Item>
              {getFieldDecorator("version", {
                rules: [
                  { required: true, message: "Please input a version!" }
                ],
                initialValue: initialValues ? initialValues.version : ""
              })(
                <Input
                  placeholder="Version of your service (example: v1)"
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
              })(<Input placeholder="eg: spaceuptech/basic-service" />)}
            </Form.Item>
            <FormItemLabel name="Docker registry type" />
            <Form.Item>
              {getFieldDecorator("registryType", {
                initialValue: initialValues
                  ? initialValues.registryType
                  : "public"
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
                    {getFieldDecorator("dockerSecret", {
                      rules: [
                        {
                          required: true,
                          message: "Please input docker secret!"
                        }
                      ],
                      initialValue: initialValues
                        ? initialValues.dockerSecret
                        : ""
                    })(
                      <Select placeholder="Select docker secret to be applied">
                        {dockerSecrets.map(secret => (
                          <Option value={secret}>{secret}</Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </React.Fragment>
              )}
            </React.Fragment>
            <FormItemLabel name="Ports" />
            <React.Fragment>{formItemsPorts}</React.Fragment>
            <Collapse className="deployment-collapse" bordered={false} style={{ background: 'white' }}>
              <Panel header="Advanced" key="1">
                <br />
                <FormItemLabel name="Image pull policy" />
                <Form.Item>
                  {getFieldDecorator("imagePullPolicy", {
                    initialValue: initialValues ? initialValues.imagePullPolicy : "always"
                  })(<Select style={{ width: 175 }}>
                    <Select.Option value="always">Always</Select.Option>
                    <Select.Option value="pull-if-not-exists">If not present</Select.Option>
                  </Select>)}
                </Form.Item>
                <FormItemLabel
                  name="Resources"
                  description="The resources to provide to each instance of the service"
                />
                <Form.Item>
                  {getFieldDecorator("cpu", {
                    initialValue: initialValues ? initialValues.cpu : 0.1
                  })(<Input addonBefore="vCPUs" style={{ width: 160 }} />)}
                  {getFieldDecorator("memory", {
                    initialValue: initialValues ? initialValues.memory : 100
                  })(
                    <Input
                      addonBefore="Memory (in MBs)"
                      style={{ width: 240, marginLeft: 32 }}
                    />
                  )}
                </Form.Item>
                <FormItemLabel name="GPUs" />
                <Form.Item>
                  {getFieldDecorator("addGPUs", {
                    valuePropName: "checked",
                    initialValue:
                      initialValues && initialValues.gpuType ? true : false
                  })(
                    <Checkbox>
                      Consume GPUs
                    </Checkbox>
                  )}
                </Form.Item>
                {getFieldValue("addGPUs") === true && <React.Fragment>
                  <FormItemLabel name="GPU resources" />
                  <Form.Item>
                    {getFieldDecorator("gpuType", {
                      initialValue: initialValues ? initialValues.gpuType : "nvdia"
                    })(
                      <Select
                        placeholder="Select gpu type"
                        style={{ width: 160 }}
                      >
                        <Option value="nvdia">NVDIA</Option>
                        <Option value="amd">AMD</Option>
                      </Select>
                    )}
                    {getFieldDecorator("gpuCount", {
                      initialValue: initialValues ? initialValues.gpuCount : 1
                    })(
                      <Input addonBefore="No of GPUs" style={{ width: 240, marginLeft: 32 }} min={1} />
                    )}
                  </Form.Item>
                </React.Fragment>}
                <FormItemLabel
                  name="Auto scaling"
                  description="Auto scale your container instances between min and max replicas based on the following config"
                />
                <Form.Item>
                  {getFieldDecorator("concurrency", {
                    initialValue: initialValues ? initialValues.concurrency : 50
                  })(
                    <Input addonBefore={autoscalingModeSelect} style={{ width: 400 }} min={1} />
                  )}
                </Form.Item>
                <FormItemLabel
                  name="Replicas"
                />
                <Form.Item>
                  {getFieldDecorator("min", {
                    initialValue: initialValues ? initialValues.min : 1
                  })(
                    <Input addonBefore="Min" style={{ width: 160 }} min={1} />
                  )}
                  {getFieldDecorator("max", {
                    initialValue: initialValues ? initialValues.max : 100
                  })(
                    <Input
                      addonBefore="Max"
                      style={{ width: 160, marginLeft: 32 }}
                      min={1}
                    />
                  )}
                </Form.Item>
                <FormItemLabel name="Environment variables" />
                {formItemsEnv}
                <Button onClick={() => envAdd()} style={{ marginBottom: 20 }}>
                  {envKeys.length === 0
                    ? "Add an environment variable"
                    : "Add another environment variable"}
                </Button>
                <FormItemLabel name="Secrets" />
                <Form.Item>
                  {getFieldDecorator("secrets", {
                    initialValue: initialValues ? initialValues.secrets : []
                  })(
                    <Select
                      mode="multiple"
                      placeholder="Select secrets to be applied"
                      style={{ width: 410 }}
                    >
                      {secrets.map(secret => (
                        <Option value={secret}>{secret}</Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
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
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create({})(AddDeploymentForm);
