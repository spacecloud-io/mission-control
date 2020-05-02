import React, { useState } from "react";
import "./add-deployment-form.css";
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { notify } from "../../../utils";
import { Form } from 'antd'
import { DeleteOutlined, RightOutlined } from '@ant-design/icons';

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

let ports = 1;
let env = 0;
let white = 1;
let upstreams = 1;
const AddDeploymentForm = props => {
  const { initialValues, projectId, dockerSecrets, secrets } = props;
  const [form] = Form.useForm();
  const [registryType, setRegistryType] = useState();
  const [addGPUs, setAddGPUs] = useState();
  const [keys, setKeys] = useState();
  const [envKeys, setEnvKeys] = useState();
  const [whiteKeys, setWhiteKeys] = useState();
  const [upstreamsKeys, setUpstreamsKeys] = useState();


  const handleChangedValues = ({ registryType, addGPUs, keys, envKeys, whiteKeys, upstreamsKeys }) => {
    setRegistryType(registryType);
    setAddGPUs(addGPUs);
    setKeys(keys);
    setEnvKeys(envKeys);
    setWhiteKeys(whiteKeys);
    setUpstreamsKeys(upstreamsKeys);
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
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
    });
  };

  // PORTS
  const remove = k => {
    if (keys.length === 1) {
      return;
    }

    form.setFieldsValue({
      keys: keys.filter(key => key !== k)
    });
  };

  const add = () => {
    const nextKeys = keys.concat(ports++);
    form.setFieldsValue({
      keys: nextKeys
    });
  };

  const formItemsPorts = keys.map((k, index) => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item name={`ports[${k}].protocol`} style={{ display: "inline-block" }}>
            {/* initialValue:
              initialValues && initialValues.ports[k]
                ? initialValues.ports[k].protocol
                : "http" */}
          (
            <Select style={{ width: 120 }}>
              <Option value="http">HTTP</Option>
            </Select>
          )
        </Form.Item>
        <br />
        {index === keys.length - 1 && (
          <Button onClick={() => add()} style={{ marginTop: -10 }}>
            Add another port
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item name={`ports[${k}].port`} style={{ marginLeft: -40, marginRight: 30 }} rules={[
              {
                required: true,
                message: "Please fill this field before adding!"
              }
            ]}>
            {/* initialValue:
              initialValues && initialValues.ports[k]
                ? initialValues.ports[k].port
                : "" */}
          (
            <InputNumber
              placeholder="Port (Example: 8080)"
              style={{ width: 280 }}
            />
          )
        </Form.Item>
      </Col>
      <Col span={5}>
        {index > 0 && (
          <Button onClick={() => remove(k)}>
            <DeleteOutlined />
          </Button>
        )}
      </Col>
    </Row>
  ));

  // ENVIRONMENT VARIABLES
  const envRemove = k => {
    form.setFieldsValue({
      envKeys: envKeys.filter(key => key !== k)
    });
  };

  const envAdd = () => {
    const nextKeys = envKeys.concat(env++);
    form.setFieldsValue({
      envKeys: nextKeys
    });
  };

  const formItemsEnv = envKeys.map(k => (
    <Row key={k}>
      <Col span={6}>
        <Form.Item name={`env[${k}].key`} style={{ display: "inline-block" }} 
        rules={[{ required: true, message: "Please enter key!" }]}>
            {/* initialValue:
              initialValues && initialValues.env[k]
                ? initialValues.env[k].key
                : "" */}
          (<Input style={{ width: 120 }} placeholder="Key" />)
        </Form.Item>
      </Col>
      <Col span={9}>
        <Form.Item name={`env[${k}].value`} style={{ marginRight: 30 }} rules={[
              {
                required: true,
                message: "Please enter value before adding another!"
              }
            ]}>
            {/* initialValue:
              initialValues && initialValues.env[k]
                ? initialValues.env[k].value
                : "" */}
          (
            <Input
              style={{ width: 280, marginLeft: -40, marginRight: 30 }}
              placeholder="Value"
            />
          )
        </Form.Item>
      </Col>
      <Col span={5}>
        <Button onClick={() => envRemove(k)}>
          <DeleteOutlined />
        </Button>
      </Col>
    </Row>
  ));

  //WHITELIST
  const whiteRemove = k => {
    if (whiteKeys.length === 1) {
      return;
    }

    form.setFieldsValue({
      whiteKeys: whiteKeys.filter(key => key !== k)
    });
  };

  const whiteAdd = () => {
    const nextKeys = whiteKeys.concat(white++);
    form.setFieldsValue({
      whiteKeys: nextKeys
    });
  };

  const formItemsWhite = whiteKeys.map((k, index) => (
    <Row
      key={k}
      className={index === whiteKeys.length - 1 ? "bottom-spacing" : ""}
    >
      <Col span={10}>
        <Form.Item name={`whitelists[${k}].projectId`} style={{ display: "inline-block" }} rules={[
              {
                required: true,
                message: "Please fill the project id of the service!"
              }
            ]}>
            {/* initialValue:
              initialValues && initialValues.whitelists[k]
                ? initialValues.whitelists[k].projectId
                : projectId */}
          (
            <Input
              style={{ width: 230 }}
              placeholder="Project ID ( * to select all )"
            />
          )
        </Form.Item>
        <RightOutlined style={{ fontSize: 12, marginLeft: 16, marginTop: 8 }} />
        <br />
        {index === whiteKeys.length - 1 && (
          <Button onClick={() => whiteAdd()} style={{ marginTop: -10 }}>
            Add another whitelist
          </Button>
        )}
      </Col>
      <Col span={9}>
        <Form.Item name={`whitelists[${k}].service`} style={{ marginRight: 30 }} rules={[
              {
                required: true,
                message: "Please fill the name of the service!"
              }
            ]}>
            {/* initialValue:
              initialValues && initialValues.whitelists[k]
                ? initialValues.whitelists[k].service
                : "*" */}
          (
            <Input
              style={{ width: 230 }}
              placeholder="Service Name ( * to select all )"
            />
          )
        </Form.Item>
      </Col>
      <Col span={3}>
        <Button onClick={() => whiteRemove(k)}>
          <DeleteOutlined />
        </Button>
      </Col>
    </Row>
  ));

  //UPSTREAMS
  const upstreamsRemove = k => {
    if (upstreamsKeys.length === 1) {
      return;
    }

    form.setFieldsValue({
      upstreamsKeys: upstreamsKeys.filter(key => key !== k)
    });
  };

  const upstreamsAdd = () => {
    const nextKeys = upstreamsKeys.concat(upstreams++);
    form.setFieldsValue({
      upstreamsKeys: nextKeys
    });
  };

  const formItemsUpstreams = upstreamsKeys.map((k, index) => (
    <Row
      key={k}
      className={index === upstreamsKeys.length - 1 ? "bottom-spacing" : ""}
    >
      <Col span={10}>
        <Form.Item name={`upstreams[${k}].projectId`} style={{ display: "inline-block" }} rules={[
              {
                required: true,
                message: "Please fill the project id of the upstream service!"
              }
            ]}>
            {/* initialValue:
              initialValues && initialValues.upstreams[k]
                ? initialValues.upstreams[k].projectId
                : projectId */}
          (
            <Input
              style={{ width: 230 }}
              placeholder="Project ID ( * to select all )"
            />
          )
        </Form.Item>
        <RightOutlined style={{ fontSize: 12, marginLeft: 16, marginTop: 8 }} />
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
        <Form.Item name={`upstreams[${k}].service`} style={{ marginRight: 30 }} rules={[
              {
                required: true,
                message: "Please fill the name of the upstream service!"
              }
            ]}>
            {/* initialValue:
              initialValues && initialValues.upstreams[k]
                ? initialValues.upstreams[k].service
                : "*" */}
          (
            <Input
              style={{ width: 230 }}
              placeholder="Service Name ( * to select all )"
            />
          )
        </Form.Item>
      </Col>
      <Col span={5}>
        <Button onClick={() => upstreamsRemove(k)}>
          <DeleteOutlined />
        </Button>
      </Col>
    </Row>
  ));

  const autoscalingModeSelect = (
    <Form.Item name="autoscalingMode" style={{ marginBottom: 0 }}>
      (
        <Select
          placeholder="Select auto scaling mode"
          style={{ width: 240, top: 4 }}
        >
          <Option value="per-second">Requests per second</Option>
          <Option value="parallel">Parallel requests</Option>
        </Select>
      )
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
        <Form layout="vertical" form={form} onValuesChange={handleChangedValues} onFinish={handleSubmitClick}
        initialValues={{ 'id': initialValues ? initialValues.id : "", 'version': initialValues ? initialValues.version : "",
        'dockerImage': initialValues ? initialValues.dockerImage : "", 'registryType': initialValues ? initialValues.registryType : "public",
        'imagePullPolicy': initialValues ? initialValues.imagePullPolicy : "pull-if-not-exists", 'cpu': initialValues ? initialValues.cpu : 0.1,
        'memory': initialValues ? initialValues.memory : 100, 'addGPUs': initialValues && initialValues.gpuType ? true : false,  
        'gpuType': initialValues ? initialValues.gpuType : "nvdia", 'gpuCount': initialValues ? initialValues.gpuCount : 1, 
        'concurrency': initialValues ? initialValues.concurrency : 50, 'min': initialValues ? initialValues.min : 1, 
        'max': initialValues ? initialValues.max : 100, 'secrets': initialValues ? initialValues.secrets : [], 
        'keys': initialValues ? initialValues.ports.map((_, index) => index) : [0], 
        'envKeys': initialValues ? initialValues.env.map((_, index) => index) : [], 
        'whiteKeys': initialValues ? initialValues.whitelists.map((_, index) => index) : [0], 
        'upstreamsKeys': initialValues ? initialValues.upstreams.map((_, index) => index) : [0], 
        'autoscalingMode': initialValues ? initialValues.autoscalingMode : "parallel" }}>
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
              (
                <Input
                  placeholder="Unique name for your service"
                  style={{ width: 288 }}
                  disabled={initialValues ? true : false}
                />
              )
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
              (
                <Input
                  placeholder="Version of your service (example: v1)"
                  style={{ width: 288 }}
                  disabled={initialValues ? true : false}
                />
              )
            </Form.Item>
            <FormItemLabel name="Docker container" />
            <Form.Item name="dockerImage" rules={[
                  {
                    required: true,
                    message: "Please input docker container!"
                  }
                ]}>
              (<Input placeholder="eg: spaceuptech/basic-service" />)
            </Form.Item>
            <FormItemLabel name="Docker registry type" />
            <Form.Item name="registryType">
              (
                <Radio.Group>
                  <Radio value="public">Public Registry</Radio>
                  <Radio value="private">Private Registry</Radio>
                </Radio.Group>
              )
            </Form.Item>
            <React.Fragment>
              {registryType === "private" && (
                <React.Fragment>
                  <FormItemLabel
                    name="Docker secret"
                    description="Docker secret for authentication to pull private Docker images"
                  />
                  <Form.Item>
                    {/* {getFieldDecorator("dockerSecret", {
                      rules: [
                        {
                          required: true,
                          message: "Please input docker secret!"
                        }
                      ],
                      initialValue: initialValues
                        ? initialValues.dockerSecret
                        : ""
                    })( */}
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
                <Form.Item name="imagePullPolicy">
                  (<Select style={{ width: 175 }}>
                    <Select.Option value="always">Always</Select.Option>
                    <Select.Option value="pull-if-not-exists">If not present</Select.Option>
                  </Select>)
                </Form.Item>
                <FormItemLabel
                  name="Resources"
                  description="The resources to provide to each instance of the service"
                />
                <Form.Item name="cpu">
                  (<Input addonBefore="vCPUs" style={{ width: 160 }} />)
                  (
                    <Input
                      addonBefore="Memory (in MBs)"
                      style={{ width: 240, marginLeft: 32 }}
                    />
                  )
                </Form.Item>
                <FormItemLabel name="GPUs" />
                <Form.Item name="addGPUs" valuePropName="checked">
                  (
                    <Checkbox>
                      Consume GPUs
                    </Checkbox>
                  )
                </Form.Item>
                {addGPUs === true && <React.Fragment>
                  <FormItemLabel name="GPU resources" />
                  <Form.Item>
                    (
                      <Select
                        placeholder="Select gpu type"
                        style={{ width: 160 }}
                      >
                        <Option value="nvdia">NVDIA</Option>
                        <Option value="amd">AMD</Option>
                      </Select>
                    )
                    (
                      <Input addonBefore="No of GPUs" style={{ width: 240, marginLeft: 32 }} min={1} />
                    )
                  </Form.Item>
                </React.Fragment>}
                <FormItemLabel
                  name="Auto scaling"
                  description="Auto scale your container instances between min and max replicas based on the following config"
                />
                <Form.Item name="concurrency">
                  (
                    <Input addonBefore={autoscalingModeSelect} style={{ width: 400 }} min={1} />
                  )
                </Form.Item>
                <FormItemLabel
                  name="Replicas"
                />
                <Form.Item name="min">
                  (
                    <Input addonBefore="Min" style={{ width: 160 }} min={1} />
                  )
                  (
                    <Input
                      addonBefore="Max"
                      style={{ width: 160, marginLeft: 32 }}
                      min={1}
                    />
                  )
                </Form.Item>
                <FormItemLabel name="Environment variables" />
                {formItemsEnv}
                <Button onClick={() => envAdd()} style={{ marginBottom: 20 }}>
                  {envKeys.length === 0
                    ? "Add an environment variable"
                    : "Add another environment variable"}
                </Button>
                <FormItemLabel name="Secrets" />
                <Form.Item name="secrets">
                  (
                    <Select
                      mode="multiple"
                      placeholder="Select secrets to be applied"
                      style={{ width: 410 }}
                    >
                      {secrets.map(secret => (
                        <Option value={secret}>{secret}</Option>
                      ))}
                    </Select>
                  )
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

export default AddDeploymentForm;
