import React from "react";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { Form, AutoComplete } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
const { Option } = Select;
const { Panel } = Collapse;

const AddTaskForm = props => {
  const { initialValues, dockerSecrets, secrets } = props;
  const [form] = Form.useForm();

  const formInitialValues = {
    id: initialValues ? initialValues.id : "",
    dockerImage: initialValues ? initialValues.docker.image : "",
    registryType: (initialValues && initialValues.docker.secret) ? "private" : "public",
    dockerSecret: initialValues ? initialValues.docker.secret : "",
    ports: initialValues ? initialValues.ports : [],
    imagePullPolicy: initialValues ? initialValues.docker.imagePullPolicy : "pull-if-not-exists",
    dockerCmd: initialValues && initialValues.docker.cmd ? initialValues.docker.cmd : [],
    cpu: initialValues ? initialValues.resources.cpu / 1000 : 0.1,
    memory: initialValues ? initialValues.resources.memory : 100,
    addGPUs: initialValues && initialValues.resources.gpu && initialValues.resources.gpu.type ? true : false,
    gpuType: initialValues && initialValues.resources.gpu ? initialValues.resources.gpu.type : "nvdia",
    gpuCount: initialValues && initialValues.resources.gpu ? initialValues.resources.gpu.value : 1,
    secrets: (initialValues && initialValues.secrets && initialValues.secrets.length > 0) ? initialValues.secrets : [],
    env: (initialValues && Object.keys(initialValues.env).length > 0)
      ? Object.entries(initialValues.env).map(([key, value]) => ({
        key: key,
        value: value
      }))
      : [],
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      const gpu = values["addGPUs"] === true ? { type: values["gpuType"], value: Number(values["gpuCount"]) } : undefined
      values.cpu = Number(values.cpu);
      values.memory = Number(values.memory);
      values.min = Number(values.min);
      values.max = Number(values.max);
      values.concurrency = Number(values.concurrency);
      values.gpu = gpu
      values.serviceType = "image";
      values.dockerSecret = values.registryType === "private" ? values.dockerSecret : undefined
      delete values["addGPUs"];
      delete values["gpuType"];
      delete values["gpuCount"];
      delete values["registryType"];
      props.handleSubmit(values, initialValues ? "edit" : "add")
      props.handleCancel()
    });
  };

  const modalProps = {
    className: "edit-item-modal",
    visible: props.visible,
    width: 720,
    okText: initialValues ? "Save" : "Add",
    title: initialValues ? "Update Task" : "Add task",
    onOk: handleSubmitClick,
    onCancel: props.handleCancel
  };
  return (
    <div>
      <Modal {...modalProps}>
        <Form layout="vertical" form={form} initialValues={formInitialValues}>
          <React.Fragment>
            <FormItemLabel name="Task ID" />
            <Form.Item name="id" rules={[
              {
                validator: (_, value, cb) => {
                  if (!value) {
                    cb("Please provide a task id!")
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
                placeholder="Task ID"
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
                <AutoComplete placeholder="Select docker secret to be applied" options={dockerSecrets.map(secret => ({ value: secret }))} />
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
                <FormItemLabel name="Docker commands" />
                <Form.List name="dockerCmd">
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field) => (
                          <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                            <Form.Item
                              {...field}
                              validateTrigger={['onChange', 'onBlur']}
                              rules={[
                                {
                                  required: true,
                                  message: "Please input a value",
                                }
                              ]}
                              noStyle
                            >
                              <Input placeholder="Docker command" style={{ width: "90%" }} />
                            </Form.Item>
                            <DeleteOutlined
                              style={{ marginLeft: 16 }}
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          </Form.Item>
                        ))}
                        <Form.Item>
                          <Button onClick={() => {
                            form.validateFields(fields.map(obj => ["dockerCmd", obj.name]))
                              .then(() => add())
                              .catch(ex => console.log("Exception", ex))
                          }}>
                            <PlusOutlined /> Add
                        </Button>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
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
                                <DeleteOutlined
                                  style={{ lineHeight: "32px" }}
                                  onClick={() => {
                                    remove(field.name);
                                  }}
                                />
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
                    mode="tags"
                    placeholder="Select secrets to be applied"
                    style={{ width: 410 }}
                  >
                    {secrets.map(secret => (
                      <Option value={secret}>{secret}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Panel>
            </Collapse>
          </React.Fragment>
        </Form>
      </Modal>
    </div >
  );
};

export default AddTaskForm;
