import React from "react";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { Form } from 'antd'
import { DeleteOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock";

import {
  Modal,
  Radio,
  Input,
  Row,
  Col,
  Select,
  Button,
  Collapse,
  InputNumber,
  Checkbox,
} from "antd";
import { notify } from "../../../utils";
const { Option } = Select;
const { Panel } = Collapse;

const AddDeploymentForm = props => {
  const { initialValues, projectId, dockerSecrets, secrets } = props;
  const [form] = Form.useForm();

  const formInitialValues = {
    id: initialValues ? initialValues.id : "",
    version: initialValues ? initialValues.version : "",
    registryType: initialValues ? initialValues.registryType : "public",
    dockerImage: initialValues ? initialValues.dockerImage : "",
    dockerSecret: initialValues ? initialValues.dockerSecret : "",
    imagePullPolicy: initialValues ? initialValues.imagePullPolicy : "pull-if-not-exists",
    cpu: initialValues ? initialValues.cpu : 0.1,
    memory: initialValues ? initialValues.memory : 100,
    addGPUs: initialValues && initialValues.gpuType ? true : false,
    gpuType: initialValues ? initialValues.gpuType : "nvdia",
    gpuCount: initialValues ? initialValues.gpuCount : 1,
    concurrency: initialValues ? initialValues.concurrency : 50,
    min: initialValues ? initialValues.min : 1,
    max: initialValues ? initialValues.max : 100,
    secrets: initialValues ? initialValues.secrets : [],
    autoscalingMode: initialValues ? initialValues.autoscalingMode : "parallel",
    ports: (initialValues && initialValues.ports.length > 0) ? initialValues.ports : [{ protocol: "http", port: "" }],
    env: (initialValues && initialValues.env.length > 0) ? initialValues.env : [],
    whitelists: (initialValues && initialValues.whitelists.length > 0) ? initialValues.whitelists : [{ projectId: props.projectId, service: "*" }],
    upstreams: (initialValues && initialValues.upstreams.length > 0) ? initialValues.upstreams : [{ projectId: props.projectId, service: "*" }]
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      const gpu = values["addGPUs"] === true ? { type: values["gpuType"], value: Number(values["gpuCount"]) } : undefined
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
        .then(() => props.handleCancel())
    });
  };

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
        <Form layout="vertical" form={form} initialValues={formInitialValues}>
          <React.Fragment>
            <FormItemLabel name="Service ID" />
            <Form.Item name="id" rules={[
              {
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please provide a service id!")
                    return
                  }
                  if (!(/^[0-9a-zA-Z]+$/.test(value))) {
                    cb("Service ID can only contain alphanumeric characters!")
                    return
                  }
                  cb()
                }
              }
            ]}>
              <Input
                placeholder="Unique name for your service"
                style={{ width: 288 }}
                disabled={initialValues ? true : false}
              />
            </Form.Item>
            <FormItemLabel name="Version" />
            <Form.Item name="version" rules={[
              {
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please provide a version!")
                    return
                  }
                  if (!(/^[0-9a-zA-Z_.]+$/.test(value))) {
                    cb("Version can only contain alphanumeric characters, dots and underscores!")
                    return
                  }
                  cb()
                }
              }
            ]}>
              <Input
                placeholder="Version of your service (example: v1)"
                style={{ width: 288 }}
                disabled={initialValues ? true : false}
              />
            </Form.Item>
            <FormItemLabel name="Docker container" />
            <Form.Item name="dockerImage" rules={[
              {
                required: true,
                message: "Please input docker container!"
              }
            ]}>
              <Input placeholder="eg: spaceuptech/basic-service" />
            </Form.Item>
            <FormItemLabel name="Docker registry type" />
            <Form.Item name="registryType">
              <Radio.Group>
                <Radio value="public">Public Registry</Radio>
                <Radio value="private">Private Registry</Radio>
              </Radio.Group>
            </Form.Item>
            <ConditionalFormBlock dependency="registryType" condition={() => form.getFieldValue("registryType") === "private"}>
              <FormItemLabel
                name="Docker secret"
                description="Docker secret for authentication to pull private Docker images"
              />
              <Form.Item name="dockerSecret" rules={[
                {
                  required: true,
                  message: "Please input docker secret!"
                }]
              }>
                <Select placeholder="Select docker secret to be applied">
                  {dockerSecrets.map(secret => (
                    <Option value={secret}>{secret}</Option>
                  ))}
                </Select>
              </Form.Item>
            </ConditionalFormBlock>
            <FormItemLabel name="Ports" />
            <React.Fragment>
              <Form.List name="ports" style={{ display: "inline-block" }}>
                {(fields, { add, remove }) => {
                  return (
                    <div>
                      {fields.map((field) => (
                        <React.Fragment>
                          <Row key={field} gutter={24}>
                            <Col>
                              <Form.Item
                                name={[field.name, "protocol"]}
                                key={[field.name, "protocol"]}
                                style={{ display: "inline-block" }}
                                rules={[{ required: true, message: "Please enter protocol!" }]}>
                                <Select style={{ width: 120 }}>
                                  <Option value="http">HTTP</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col>
                              <Form.Item
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[{ required: true, message: "Please enter port!" }]}
                                name={[field.name, "port"]}
                                key={[field.name, "port"]}
                              >
                                <InputNumber
                                  placeholder="Port (Example: 8080)"
                                  style={{ width: 280 }}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="auto">
                              {fields.length > 1 ? (
                                <DeleteOutlined
                                  style={{ lineHeight: "32px" }}
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                />
                              ) : null}
                            </Col>
                          </Row>
                        </React.Fragment>
                      ))}
                      <Form.Item>
                        <Button
                          onClick={() => {
                            form.validateFields([...fields.map(obj => ["ports", obj.name, "port"]), ...fields.map(obj => ["ports", obj.name, "protocol"])])
                              .then(() => add({ protocol: "http", port: "" }))
                              .catch(ex => console.log("Exception", ex))
                          }}
                          style={{ marginTop: -10 }}
                        >
                          <PlusOutlined /> Add another port
                        </Button>
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.List>
            </React.Fragment>
            <Collapse bordered={false} style={{ background: 'white' }}>
              <Panel header="Advanced" key="1">
                <br />
                <FormItemLabel name="Image pull policy" />
                <Form.Item name="imagePullPolicy">
                  <Select style={{ width: 175 }}>
                    <Select.Option value="always">Always</Select.Option>
                    <Select.Option value="pull-if-not-exists">If not present</Select.Option>
                  </Select>
                </Form.Item>
                <FormItemLabel
                  name="Resources"
                  description="The resources to provide to each instance of the service"
                />
                <Input.Group compact>
                  <Form.Item name="cpu">
                    <Input addonBefore="vCPUs" style={{ width: 160 }} />
                  </Form.Item>
                  <Form.Item name="memory">
                    <Input addonBefore="Memory (in MBs)" style={{ width: 240, marginLeft: 32 }} />
                  </Form.Item>
                </Input.Group>
                <FormItemLabel name="GPUs" />
                <Form.Item name="addGPUs" valuePropName="checked">
                  <Checkbox>
                    Consume GPUs
                    </Checkbox>
                </Form.Item>
                <ConditionalFormBlock dependency="addGPUs" condition={() => form.getFieldValue("addGPUs")}>
                  <FormItemLabel name="GPU resources" />
                  <Input.Group compact>
                    <Form.Item name="gpuType">
                      <Select
                        placeholder="Select gpu type"
                        style={{ width: 160 }}
                      >
                        <Option value="nvdia">NVDIA</Option>
                        <Option value="amd">AMD</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="gpuCount">
                      <Input addonBefore="No of GPUs" style={{ width: 240, marginLeft: 32 }} min={1} />
                    </Form.Item>
                  </Input.Group>
                </ConditionalFormBlock>
                <FormItemLabel
                  name="Auto scaling"
                  description="Auto scale your container instances between min and max replicas based on the following config"
                />
                <Input.Group compact>
                  <Form.Item name="autoscalingMode" style={{ marginBottom: 0 }}>
                    <Select placeholder="Select auto scaling mode">
                      <Option value="per-second">Requests per second</Option>
                      <Option value="parallel">Parallel requests</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="concurrency">
                    <Input style={{ width: 400 }} min={1} />
                  </Form.Item>
                </Input.Group>
                <FormItemLabel name="Replicas" />
                <Input.Group compact>
                  <Form.Item name="min">
                    <Input addonBefore="Min" style={{ width: 160 }} min={0} />
                  </Form.Item>
                  <Form.Item name="max">
                    <Input
                      addonBefore="Max"
                      style={{ width: 160, marginLeft: 32 }}
                      min={1}
                    />
                  </Form.Item>
                </Input.Group>
                <FormItemLabel name="Environment variables" />
                <Form.List name="env" style={{ display: "inline-block" }}>
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field) => (
                          <React.Fragment>
                            <Row key={field}>
                              <Col span={6}>
                                <Form.Item
                                  key={[field.name, "key"]}
                                  name={[field.name, "key"]}
                                  style={{ display: "inline-block" }}
                                  rules={[{ required: true, message: "Please enter key!" }]}>
                                  <Input style={{ width: 120 }} placeholder="Key" />
                                </Form.Item>
                              </Col>
                              <Col span={9}>
                                <Form.Item
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please enter value!" }]}
                                  name={[field.name, "value"]}
                                  key={[field.name, "value"]}
                                  style={{ marginRight: 30 }}
                                >
                                  <Input
                                    style={{ width: 280, marginLeft: -40, marginRight: 30 }}
                                    placeholder="Value"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={5}>
                                {fields.length > 1 ? (
                                  <DeleteOutlined
                                    style={{ lineHeight: "32px" }}
                                    onClick={() => {
                                      remove(field.name);
                                    }}
                                  />
                                ) : null}
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Form.Item>
                          <Button
                            onClick={() => {
                              form.validateFields([...fields.map(obj => ["env", obj.name, "key"]), ...fields.map(obj => ["env", obj.name, "value"])])
                                .then(() => add())
                                .catch(ex => console.log("Exception", ex))
                            }}
                            style={{ marginTop: -10 }}
                          >
                            <PlusOutlined /> Add an environment variable
                          </Button>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
                <FormItemLabel name="Secrets" />
                <Form.Item name="secrets">
                  <Select
                    mode="multiple"
                    placeholder="Select secrets to be applied"
                    style={{ width: 410 }}
                  >
                    {secrets.map(secret => (
                      <Option value={secret}>{secret}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <FormItemLabel
                  name="Whitelists"
                  description="Only those services that are whitelisted can access you"
                />
                {/* Whitelists */}
                <Form.List name="whitelists" style={{ display: "inline-block" }}>
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field, index) => (
                          <React.Fragment>
                            <Row
                              key={fields}
                              className={index === fields.length - 1 ? "bottom-spacing" : ""}
                            >
                              <Col span={10}>
                                <Form.Item
                                  key={[field.name, "projectId"]}
                                  name={[field.name, "projectId"]}
                                  style={{ display: "inline-block" }}
                                  rules={[{ required: true, message: "Please enter the project id of the service!" }]}>
                                  <Input
                                    style={{ width: 230 }}
                                    placeholder="Project ID ( * to select all )"
                                  />
                                </Form.Item>
                                <RightOutlined style={{ fontSize: 12, marginLeft: 16, marginTop: 8 }} />
                              </Col>
                              <Col span={9}>
                                <Form.Item
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please enter the name of the service!" }]}
                                  key={[field.name, "service"]}
                                  name={[field.name, "service"]}
                                  style={{ marginRight: 30 }}
                                >
                                  <Input
                                    style={{ width: 230 }}
                                    placeholder="Service Name ( * to select all )"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={3}>
                                {fields.length > 1 ? (
                                  <DeleteOutlined
                                    style={{ lineHeight: "32px" }}
                                    onClick={() => {
                                      remove(field.name);
                                    }}
                                  />
                                ) : null}
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Form.Item>
                          <Button
                            onClick={() => {
                              form.validateFields([...fields.map(obj => ["whitelists", obj.name, "projectId"]), ...fields.map(obj => ["whitelists", obj.name, "service"])])
                                .then(() => add({ projectId }))
                                .catch(ex => console.log("Exception", ex))
                            }}
                            style={{ marginTop: -10 }}
                          >
                            <PlusOutlined /> Add another upstream service
                          </Button>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
                <FormItemLabel
                  name="Upstreams"
                  description="The upstream servces that you want to access"
                />
                <Form.List name="upstreams" style={{ display: "inline-block" }}>
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field, index) => (
                          <React.Fragment>
                            <Row
                              key={fields}
                              className={index === fields.length - 1 ? "bottom-spacing" : ""}
                            >
                              <Col span={10}>
                                <Form.Item
                                  name={[field.name, "projectId"]}
                                  key={[field.name, "projectId"]}
                                  style={{ display: "inline-block" }}
                                  rules={[{ required: true, message: "Please enter the project id of the service!" }]}>
                                  <Input
                                    style={{ width: 230 }}
                                    placeholder="Project ID ( * to select all )"
                                  />
                                </Form.Item>
                                <RightOutlined style={{ fontSize: 12, marginLeft: 16, marginTop: 8 }} />
                              </Col>
                              <Col span={9}>
                                <Form.Item
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please enter the name of the service!" }]}
                                  key={[field.name, "service"]}
                                  name={[field.name, "service"]}
                                  style={{ marginRight: 30 }}
                                >
                                  <Input
                                    style={{ width: 230 }}
                                    placeholder="Service Name ( * to select all )"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={3}>
                                {fields.length > 1 ? (
                                  <DeleteOutlined
                                    style={{ lineHeight: "32px" }}
                                    onClick={() => {
                                      remove(field.name);
                                    }}
                                  />
                                ) : null}
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Form.Item>
                          <Button
                            onClick={() => {
                              form.validateFields([...fields.map(obj => ["upstreams", obj.name, "projectId"]), ...fields.map(obj => ["upstreams", obj.name, "service"])])
                                .then(() => add({ projectId }))
                                .catch(ex => console.log("Exception", ex))
                            }}
                            style={{ marginTop: -10 }}
                          >
                            <PlusOutlined /> Add another upstream service
                          </Button>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
              </Panel>
            </Collapse>
          </React.Fragment>
        </Form>
      </Modal>
    </div >
  );
};

export default AddDeploymentForm;
