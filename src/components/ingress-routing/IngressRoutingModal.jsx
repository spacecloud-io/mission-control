import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Modal, Input, Select, Checkbox, Row, Col, Button, message, Form, Collapse, Alert } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { notify } from "../../utils";
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import { defaultIngressRoutingRule } from '../../constants';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/go/go';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';

const { Option } = Select;
const { Panel } = Collapse;

function AlertMsgApplyTransformations() {
  return (
    <div>
      <b>Info</b> <br />
      Describe the transformed request/response body using <a href='https://golang.org/pkg/text/template/' style={{ color: '#7EC6FF' }}>
        <b>Go templates</b>
      </a>. Space Cloud will execute the specified template to generate the new request/response.
    </div>
  );
}

const IngressRoutingModal = props => {
  const [form] = Form.useForm();

  const initialValues = props.initialValues;
  const initialRule = (initialValues) ? initialValues.rule : defaultIngressRoutingRule;
  const [ruleData, setRuleData] = useState(JSON.stringify(initialRule, null, 2));
  const [requestTemplateData, setRequestTemplateData] = useState(initialValues ? initialValues.requestTemplate : "");
  const [responseTemplateData, setResponseTemplateData] = useState(initialValues ? initialValues.responseTemplate : "");
  const children = [];

  const checkHost = (host) => {
    if (host.length === 1 && host[0] === "*") {
      return false;
    } else {
      return true;
    }
  }

  const checkMethod = (methods) => {
    if (methods.length === 0 || (methods.length === 1 && methods[0] === "*")) {
      return false;
    } else {
      return true;
    }
  }

  const formInitialValues = {
    routeType: initialValues ? initialValues.routeType : "prefix",
    url: initialValues ? initialValues.url : "",
    performRewrite: initialValues && initialValues.rewrite ? true : false,
    rewrite: initialValues ? initialValues.rewrite : "",
    allowSpecificHosts: initialValues && checkHost(initialValues.allowedHosts) ? true : false,
    allowedHosts: initialValues && checkHost(initialValues.allowedHosts) ? initialValues.allowedHosts : [],
    allowSpecificMethods: initialValues && checkMethod(initialValues.allowedMethods) ? true : false,
    allowedMethods: initialValues && checkMethod(initialValues.allowedMethods) ? initialValues.allowedMethods : [],
    targets: (initialValues && initialValues.targets) ? initialValues.targets : [{ scheme: "http" }],
    setHeaders: (initialValues && initialValues.headers && initialValues.headers.length > 0) ? true : false,
    headers: (initialValues && initialValues.headers && initialValues.headers.length > 0) ? initialValues.headers : [{ key: "", value: "" }],
    applyTransformations: (initialValues && (initialValues.requestTemplate || initialValues.responseTemplate)) ? true : false,
    outputFormat: (initialValues && initialValues.outputFormat) ? initialValues.outputFormat : "yaml"
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      try {
        if (!values.allowSpecificHosts) values.allowedHosts = ["*"]
        if (!values.allowSpecificMethods) values.allowedMethods = ["*"]
        if (!values.performRewrite) values.rewrite = undefined
        if (!values.setHeaders) values.headers = []
        if (values.applyTransformations) {
          values.requestTemplate = requestTemplateData
          values.responseTemplate = responseTemplateData
        }
        values.rule = ruleData ? JSON.parse(ruleData) : undefined
        values.targets = values.targets.map(o => Object.assign({}, o, { weight: Number(o.weight), port: Number(o.port) }))
        const weightSum = values.targets.reduce((prev, curr) => prev + curr.weight, 0)
        if (weightSum !== 100) {
          message.error("Sum of all the target weights should be 100")
          return
        }
        delete values["allowSpecificHosts"];
        delete values["allowSpecificMethods"];
        delete values["performRewrite"];
        delete values["setHeaders"];
        delete values["applyTransformations"]
        props.handleSubmit(values).then(() => props.handleCancel());
      } catch (error) {
        notify("error", "Error", error)
      }
    })
  };

  return (
    <div>
      <Modal
        title={`${props.initialValues ? "Edit" : "Add"} Routing Rules`}
        visible={true}
        width={1200}
        okText={props.initialValues ? "Save" : "Add"}
        onCancel={props.handleCancel}
        onOk={handleSubmitClick}
      >
        <Form layout="vertical" form={form}
          initialValues={formInitialValues}>
          <FormItemLabel name="Route matching type" />
          <Form.Item name="routeType" rules={[{ required: true, message: "Route type is required" }]}>
            <Select style={{ width: 200 }}>
              <Select.Option value="prefix">Prefix Match</Select.Option>
              <Select.Option value="exact">Exact Match</Select.Option>
            </Select>
          </Form.Item>
          <ConditionalFormBlock dependency="routeType" condition={() => form.getFieldValue("routeType") === "prefix"}>
            <FormItemLabel name="Prefix" />
            <Form.Item name="url" rules={[{ required: true, message: "Please provide prefix" }]}>
              <Input placeholder="Prefix for incoming request (eg:/v1/)" />
            </Form.Item>
          </ConditionalFormBlock>
          <ConditionalFormBlock dependency="routeType" condition={() => form.getFieldValue("routeType") === "exact"}>
            <FormItemLabel name="URL" />
            <Form.Item name="url" rules={[{ required: true, message: "Please provide URL" }]}>
              <Input placeholder="The exact URL of incoming request (eg:/v1/foo/bar)" />
            </Form.Item>
          </ConditionalFormBlock>
          <FormItemLabel name="Rewrite" />
          <Form.Item name="performRewrite" valuePropName="checked">
            <Checkbox>
              Rewrite incoming request URL to target service
              </Checkbox>
          </Form.Item>
          <ConditionalFormBlock dependency="performRewrite" condition={() => form.getFieldValue("performRewrite")}>
            <FormItemLabel name="Rewrite URL" />
            <Form.Item name="rewrite" rules={[{ required: true, message: "Please provide URL" }]}>
              <Input placeholder="New Request URL that will override the incoming request " />
            </Form.Item>
          </ConditionalFormBlock>
          <FormItemLabel name="Hosts" />
          <Form.Item name="allowSpecificHosts" valuePropName="checked">
            <Checkbox>Allow traffic with specified hosts only</Checkbox>
          </Form.Item>
          <ConditionalFormBlock dependency="allowSpecificHosts" condition={() => form.getFieldValue("allowSpecificHosts")}>
            <FormItemLabel name="Allowed hosts " />
            <Form.Item name="allowedHosts" rules={[
              {
                required: true,
                message: "Please enter the domain for the project"
              }
            ]}>
              <Select
                mode="tags"
                placeholder="Add hosts that you want to allow for this route"
                style={{ width: "100%" }}
                tokenSeparators={[","]}
              >
                {children}
              </Select>
            </Form.Item>
          </ConditionalFormBlock>
          <FormItemLabel name="Methods" />
          <Form.Item name="allowSpecificMethods" valuePropName="checked">
            <Checkbox>Allow traffic with specified methods only</Checkbox>
          </Form.Item>
          <ConditionalFormBlock dependency="allowSpecificMethods" condition={() => form.getFieldValue("allowSpecificMethods")}>
            <FormItemLabel name="Allowed methods " />
            <Form.Item name="allowedMethods" rules={[
              {
                required: true,
                message: "Please enter the domain for the project"
              }
            ]}>
              <Select
                mode="tags"
                placeholder="Add hosts that you want to allow for this route"
                style={{ width: "100%" }}
                tokenSeparators={[","]}
              >
                <Option key="GET">GET</Option>
                <Option key="POST">POST</Option>
                <Option key="PUT">PUT</Option>
                <Option key="PATCH">PATCH</Option>
                <Option key="DELETE">DELETE</Option>
                <Option key="OPTIONS">OPTIONS</Option>
                <Option key="HEAD">HEAD</Option>
                <Option key="CONNECT">CONNECT</Option>
                <Option key="TRACE">TRACE</Option>
              </Select>
            </Form.Item>
          </ConditionalFormBlock>
          <FormItemLabel name="Targets" />
          <React.Fragment>
            <Form.List name="targets" style={{ display: "inline-block" }}>
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field) => (
                      <Row key={field.name} gutter={8}>
                        <Col span={3}>
                          <Form.Item name={[field.name, "scheme"]}
                            style={{ marginBottom: 0 }}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please enter scheme!" }]}>
                            <Select style={{ width: "100%" }}>
                              <Option value="http">HTTP</Option>
                              <Option value="https">HTTPS</Option>
                            </Select>
                          </Form.Item>
                          <br />
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                message: "Host is required!"
                              }
                            ]}
                            name={[field.name, "host"]}
                          >
                            <Input
                              placeholder="Service Host"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                validator: (_, value, cb) => {
                                  if (!value) {
                                    cb("Please provide a port value!")
                                    return
                                  }
                                  if (!Number.isInteger(Number(value))) {
                                    cb("Not a valid port value")
                                    return
                                  }
                                  cb()
                                }
                              }
                            ]}
                            name={[field.name, "port"]}
                          >
                            <Input
                              placeholder="Port"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                validator: (_, value, cb) => {
                                  if (!value) {
                                    cb("Please provide a weight!")
                                    return
                                  }
                                  const weightVal = Number(value)
                                  if (!Number.isInteger(weightVal) || !(weightVal > 0 && weightVal <= 100)) {
                                    cb("Weight should be a number between 1 to 100")
                                    return
                                  }
                                  cb()
                                }
                              }
                            ]}
                            name={[field.name, "weight"]}
                          >
                            <Input
                              placeholder="Weight between 1 to 100"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          {fields.length > 1 ? (
                            <DeleteOutlined
                              style={{ margin: "0 8px" }}
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          ) : null}
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button
                        onClick={() => {
                          const fieldKeys = [
                            ...fields.map(obj => ["targets", obj.name, "scheme"]),
                            ...fields.map(obj => ["targets", obj.name, "host"]),
                            ...fields.map(obj => ["targets", obj.name, "port"]),
                            ...fields.map(obj => ["targets", obj.name, "weight"]),
                          ]
                          form.validateFields(fieldKeys)
                            .then(() => add({ scheme: "http" }))
                            .catch(ex => console.log("Exception", ex))
                        }}
                        style={{ marginTop: -10 }}
                      >
                        <PlusOutlined /> Add another target
                          </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>
          </React.Fragment>
          <FormItemLabel name='Rule' />
          <Form.Item style={{ border: "1px solid #D9D9D9", maxWidth: "600px" }}>
            <CodeMirror
              value={ruleData}
              options={{
                mode: { name: 'javascript', json: true },
                lineNumbers: true,
                styleActiveLine: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                tabSize: 2,
                autofocus: true,
              }}
              onBeforeChange={(editor, data, value) => {
                setRuleData(value);
              }}
            />
          </Form.Item>
          <Collapse
            style={{ background: "white" }}
            bordered={false}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
          >
            <Panel
              header='Advanced'
              key='1'
            >
              <FormItemLabel name='Set headers' />
              <Form.Item name='setHeaders' valuePropName='checked'>
                <Checkbox>
                  Set the value of headers in the request
              </Checkbox>
              </Form.Item>
              <ConditionalFormBlock
                dependency='setHeaders'
                condition={() => form.getFieldValue('setHeaders') === true}
              >
                <FormItemLabel name='Headers' />
                <Form.List name="headers">
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field, index) => (
                          <React.Fragment>
                            <Row key={field}>
                              <Col span={10}>
                                <Form.Item name={[field.name, "key"]}
                                  key={[field.name, "key"]}
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input header key" }]}>
                                  <Input
                                    style={{ width: "90%", marginRight: "6%", float: "left" }}
                                    placeholder="Header key"
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={10}>
                                <Form.Item
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input header value" }]}
                                  name={[field.name, "value"]}
                                  key={[field.name, "value"]}
                                >
                                  <Input
                                    placeholder="Header value"
                                    style={{ width: "90%", marginRight: "6%", float: "left" }}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={3}>
                                <Button
                                  onClick={() => remove(field.name)}
                                  style={{ marginRight: "2%", float: "left" }}>
                                  <DeleteOutlined />
                                </Button>
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Form.Item>
                          <Button
                            onClick={() => {
                              const fieldKeys = [
                                ...fields.map(obj => ["headers", obj.name, "key"]),
                                ...fields.map(obj => ["headers", obj.name, "value"]),
                              ]
                              form.validateFields(fieldKeys)
                                .then(() => add())
                                .catch(ex => console.log("Exception", ex))
                            }}
                            style={{ marginRight: "2%", float: "left" }}
                          >
                            <PlusOutlined /> Add header</Button>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
              </ConditionalFormBlock>
              <FormItemLabel name='Apply transformations' />
              <Form.Item name='applyTransformations' valuePropName='checked'>
                <Checkbox>
                  Transform the request and/or response using templates
                  </Checkbox>
              </Form.Item>
              <ConditionalFormBlock
                dependency='applyTransformations'
                condition={() => form.getFieldValue('applyTransformations') === true}
              >
                <Alert
                  message={<AlertMsgApplyTransformations />}
                  type='info'
                  showIcon
                  style={{ marginBottom: 21 }}
                />
                <FormItemLabel name="Template output format" description="Format for parsing the template output" />
                <Form.Item name="outputFormat">
                  <Select style={{ width: 96 }}>
                    <Option value='yaml'>YAML</Option>
                    <Option value='json'>JSON</Option>
                  </Select>
                </Form.Item>
                <FormItemLabel name="Request template" hint="(Optional)" description="Template to generate the transformed request body. Keep it empty to skip transforming the request body." />
                <Form.Item style={{ border: "1px solid #D9D9D9", maxWidth: "600px" }}>
                  <CodeMirror
                    value={requestTemplateData}
                    options={{
                      mode: { name: 'go' },
                      lineNumbers: true,
                      styleActiveLine: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      tabSize: 2,
                      autofocus: true,
                    }}
                    onBeforeChange={(editor, data, value) => {
                      setRequestTemplateData(value);
                    }}
                  />
                </Form.Item>
                <FormItemLabel name="Response template" hint="(Optional)" description="Template to generate the transformed response body. Keep it empty to skip transforming the response body." />
                <Form.Item style={{ border: "1px solid #D9D9D9", maxWidth: "600px" }}>
                  <CodeMirror
                    value={responseTemplateData}
                    options={{
                      mode: { name: 'go' },
                      lineNumbers: true,
                      styleActiveLine: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      tabSize: 2,
                      autofocus: false,
                    }}
                    onBeforeChange={(editor, data, value) => {
                      setResponseTemplateData(value);
                    }}
                  />
                </Form.Item>
              </ConditionalFormBlock>
            </Panel>
          </Collapse>
        </Form>
      </Modal>
    </div>
  );
};

export default IngressRoutingModal;
