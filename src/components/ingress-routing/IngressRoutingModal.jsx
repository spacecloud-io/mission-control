import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Modal, Input, Select, Checkbox, Row, Col, Button, message, Form, Collapse, Alert } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { notify } from "../../utils";
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import { defaultIngressRoutingRule } from '../../constants';
import { Controlled as CodeMirror } from 'react-codemirror2';
import ObjectAutoComplete from "../object-autocomplete/ObjectAutoComplete";
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

function AlertMsgCacheOptions() {
  return (
    <div>
      <b>Note:</b> <br />
      URL will always be included in the caching key. Specify the other parameters (e.g. a token claim) below, that needs to be included in the caching key.
    </div>
  );
}

const IngressRoutingModal = props => {
  const [form] = Form.useForm();

  const initialValues = props.initialValues;
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

  const cacheOptions = initialValues && initialValues.cacheOptions ? initialValues.cacheOptions : []
  const initialCacheOptions = cacheOptions.filter(item => item !== "args.url")
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
    headers: (initialValues && initialValues.headers && initialValues.headers.length > 0) ? initialValues.headers.map(obj => Object.assign({}, obj, { op: obj.op ? obj.op : "set" })) : [{ op: "set", key: "", value: "" }],
    setResHeaders: (initialValues && initialValues.resHeaders && initialValues.resHeaders.length > 0) ? true : false,
    resHeaders: (initialValues && initialValues.resHeaders && initialValues.resHeaders.length > 0) ? initialValues.resHeaders.map(obj => Object.assign({}, obj, { op: obj.op ? obj.op : "set" })) : [{ op: "set", key: "", value: "" }],
    applyTransformations: (initialValues && (initialValues.requestTemplate || initialValues.responseTemplate)) ? true : false,
    outputFormat: (initialValues && initialValues.outputFormat) ? initialValues.outputFormat : "yaml",
    isRouteCacheable: initialValues ? initialValues.isRouteCacheable : false,
    cacheOptions: initialCacheOptions
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      try {
        if (!values.allowSpecificHosts) values.allowedHosts = ["*"]
        if (!values.allowSpecificMethods) values.allowedMethods = ["*"]
        if (!values.performRewrite) values.rewrite = undefined
        if (!values.setHeaders) values.headers = []
        if (!values.setResHeaders) values.resHeaders = []
        if (values.applyTransformations) {
          values.requestTemplate = requestTemplateData
          values.responseTemplate = responseTemplateData
        }
        if (values.isRouteCacheable) {
          values.cacheOptions = [...new Set([...values.cacheOptions, "args.url"])]
        }
        values.rule = defaultIngressRoutingRule
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
        delete values["setResHeaders"];
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
              <ConditionalFormBlock
                shouldUpdate={true}
                condition={() => props.isCachingEnabled}>
                <FormItemLabel name='Enable caching' />
                <Form.Item name='isRouteCacheable' valuePropName='checked'>
                  <Checkbox>
                    Enable caching for this route
                  </Checkbox>
                </Form.Item>
                <ConditionalFormBlock
                  dependency='isRouteCacheable'
                  condition={() => form.getFieldValue('isRouteCacheable') === true}
                >
                  <FormItemLabel name='Cache key parameters' />
                  <Alert
                    message={<AlertMsgCacheOptions />}
                    type='info'
                    showIcon
                    style={{ marginBottom: 21 }}
                  />
                  <Form.List name="cacheOptions">
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
                                <ObjectAutoComplete
                                  placeholder="Key to cache (e.g. args.auth.id)"
                                  options={{ args: { auth: true, token: true } }}
                                  style={{ width: "90%" }}
                                />
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
                              form.validateFields(fields.map(obj => ["cacheOptions", obj.name]))
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
                </ConditionalFormBlock>
              </ConditionalFormBlock>
              <FormItemLabel name='Modify request headers' />
              <Form.Item name='setHeaders' valuePropName='checked'>
                <Checkbox>
                  Modify the value of headers in the request
              </Checkbox>
              </Form.Item>
              <ConditionalFormBlock
                dependency='setHeaders'
                condition={() => form.getFieldValue('setHeaders') === true}
              >
                <FormItemLabel name='Specify request header modifications' />
                <Form.List name="headers">
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field, index) => (
                          <React.Fragment>
                            <Row key={field}>
                              <Col span={5}>
                                <Form.Item
                                  name={[field.name, "op"]}
                                  key={[field.name, "op"]}
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input header operation" }]}
                                  style={{ marginRight: 16 }}
                                >
                                  <Select placeholder="Select header operation">
                                    <Option value='set'>Set</Option>
                                    <Option value='add'>Add</Option>
                                    <Option value='del'>Delete</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name={[field.name, "key"]}
                                  key={[field.name, "key"]}
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input header key" }]}
                                  style={{ marginRight: 16 }}
                                >
                                  <Input placeholder="Header key" />
                                </Form.Item>
                              </Col>
                              <ConditionalFormBlock dependency="headers" condition={() => form.getFieldValue(["headers", field.name, "op"]) !== "del"}>
                                <Col span={8}>
                                  <Form.Item
                                    validateTrigger={["onChange", "onBlur"]}
                                    rules={[{ required: true, message: "Please input header value" }]}
                                    name={[field.name, "value"]}
                                    key={[field.name, "value"]}
                                    style={{ marginRight: 16 }}
                                  >
                                    <Input placeholder="Header value" />
                                  </Form.Item>
                                </Col>
                              </ConditionalFormBlock>
                              <Col span={3}>
                                {fields.length > 1 &&
                                  <Button
                                    onClick={() => remove(field.name)}
                                    style={{ marginRight: "2%", float: "left" }}>
                                    <DeleteOutlined />
                                  </Button>}
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Form.Item>
                          <Button
                            onClick={() => {
                              const fieldKeys = [
                                ...fields.map(obj => ["headers", obj.name, "op"]),
                                ...fields.map(obj => ["headers", obj.name, "key"]),
                                ...fields.map(obj => ["headers", obj.name, "value"]),
                              ]
                              form.validateFields(fieldKeys)
                                .then(() => add())
                                .catch(ex => console.log("Exception", ex))
                            }}
                            style={{ marginRight: "2%", float: "left" }}
                          >
                            <PlusOutlined /> Add modification</Button>
                        </Form.Item>
                      </div>
                    );
                  }}
                </Form.List>
              </ConditionalFormBlock>
              <FormItemLabel name='Modify response headers' />
              <Form.Item name='setResHeaders' valuePropName='checked'>
                <Checkbox>
                  Modify the value of headers in the response
              </Checkbox>
              </Form.Item>
              <ConditionalFormBlock
                dependency='setResHeaders'
                condition={() => form.getFieldValue('setResHeaders') === true}
              >
                <FormItemLabel name='Specify response header modifications' />
                <Form.List name="resHeaders">
                  {(fields, { add, remove }) => {
                    return (
                      <div>
                        {fields.map((field, index) => (
                          <React.Fragment>
                            <Row key={field}>
                              <Col span={5}>
                                <Form.Item
                                  name={[field.name, "op"]}
                                  key={[field.name, "op"]}
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input header operation" }]}
                                  style={{ marginRight: 16 }}
                                >
                                  <Select placeholder="Select header operation">
                                    <Option value='set'>Set</Option>
                                    <Option value='add'>Add</Option>
                                    <Option value='del'>Delete</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item name={[field.name, "key"]}
                                  key={[field.name, "key"]}
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input header key" }]}
                                  style={{ marginRight: 16 }}
                                >
                                  <Input placeholder="Header key" />
                                </Form.Item>
                              </Col>
                              <ConditionalFormBlock dependency="resHeaders" condition={() => form.getFieldValue(["resHeaders", field.name, "op"]) !== "del"}>
                                <Col span={8}>
                                  <Form.Item
                                    validateTrigger={["onChange", "onBlur"]}
                                    rules={[{ required: true, message: "Please input header value" }]}
                                    name={[field.name, "value"]}
                                    key={[field.name, "value"]}
                                    style={{ marginRight: 16 }}
                                  >
                                    <Input placeholder="Header value" />
                                  </Form.Item>
                                </Col>
                              </ConditionalFormBlock>
                              <Col span={3}>
                                {fields.length > 1 &&
                                  <Button
                                    onClick={() => remove(field.name)}
                                    style={{ marginRight: "2%", float: "left" }}>
                                    <DeleteOutlined />
                                  </Button>}
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Form.Item>
                          <Button
                            onClick={() => {
                              const fieldKeys = [
                                ...fields.map(obj => ["resHeaders", obj.name, "op"]),
                                ...fields.map(obj => ["resHeaders", obj.name, "key"]),
                                ...fields.map(obj => ["resHeaders", obj.name, "value"]),
                              ]
                              form.validateFields(fieldKeys)
                                .then(() => add())
                                .catch(ex => console.log("Exception", ex))
                            }}
                            style={{ marginRight: "2%", float: "left" }}
                          >
                            <PlusOutlined /> Add modification</Button>
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
