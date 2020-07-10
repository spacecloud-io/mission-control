import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProjectConfig, notify, getJWTSecret } from '../../../utils';
import { Row, Col, Button, Input, Select, Form, Collapse, Checkbox, Alert, Card, Radio } from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import GenerateTokenForm from '../../explorer/generateToken/GenerateTokenForm';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { defaultEndpointRule, endpointTypes } from "../../../constants";
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/go/go';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import { CaretRightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import RadioCards from "../../radio-cards/RadioCards";

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

function AlertMsgPreparedQueries() {
  return (
    <div>
      <b>Info</b> <br />
      Using Space Cloud as an endpoint type will make a GraphQL request to Space Cloud internally rather than a remote service. Describe the GraphQL request using <a href='https://golang.org/pkg/text/template/' style={{ color: '#7EC6FF' }}>
        <b>Go templates</b>
      </a>.
    </div>
  );
}

const EndpointForm = ({ initialValues, handleSubmit }) => {
  // Router params
  const { projectID, serviceName } = useParams();
  const projects = useSelector((state) => state.projects);

  const { kind = endpointTypes.INTERNAL, name, path, method, rule, token, requestTemplate, responseTemplate, graphTemplate, outputFormat, headers = [], resHeaders = [] } = initialValues ? initialValues : {}
  const initialRule = rule ? rule : defaultEndpointRule
  const [ruleData, setRuleData] = useState(JSON.stringify(initialRule, null, 2));
  const [requestTemplateData, setRequestTemplateData] = useState(requestTemplate);
  const [responseTemplateData, setResponseTemplateData] = useState(responseTemplate);
  const [graphTemplateData, setGraphTemplateData] = useState(graphTemplate);
  const [generateTokenModal, setGenerateTokenModal] = useState(false);

  const [form] = Form.useForm();
  const url = getProjectConfig(
    projects,
    projectID,
    `modules.remoteServices.externalServices.${serviceName}.url`
  );

  const secret = useSelector(state => getJWTSecret(state, projectID))

  const formInitialValues = {
    kind: kind,
    name: name,
    method: method ? method : "POST",
    path: path,
    overrideToken: token ? true : false,
    token: token,
    setHeaders: headers.length > 0 ? true : false,
    headers: headers.length > 0 ? headers.map(obj => Object.assign({}, obj, { op: obj.op ? obj.op : "set" })) : [{ op: "set", key: "", value: "" }],
    applyTransformations: (requestTemplate || responseTemplate) ? true : false,
    outputFormat: outputFormat ? outputFormat : "yaml"
  }

  const handleFinish = (values) => {
    values = Object.assign({}, formInitialValues, values)
    const { kind, name, method, path, token, applyTransformations, overrideToken, outputFormat, headers, setHeaders } = values
    try {
      handleSubmit(
        kind,
        name,
        method,
        path,
        JSON.parse(ruleData),
        overrideToken ? token : undefined,
        outputFormat,
        (applyTransformations || kind === endpointTypes.PREPARED) ? requestTemplateData : "",
        (applyTransformations || kind === endpointTypes.PREPARED) ? responseTemplateData : "",
        kind === endpointTypes.PREPARED ? graphTemplateData : "",
        setHeaders ? headers : undefined
      )
    } catch (error) {
      notify("error", "Error", error)
    }
  };

  useEffect(() => {
    form.setFieldsValue(formInitialValues)
  }, [formInitialValues.kind, formInitialValues.path])

  useEffect(() => {
    if (rule) {
      setRuleData(JSON.stringify(rule, null, 2))
    }
  }, [rule])

  useEffect(() => {
    setRequestTemplateData(requestTemplate)
  }, [requestTemplate])

  useEffect(() => {
    setResponseTemplateData(responseTemplate)
  }, [responseTemplate])

  useEffect(() => {
    setGraphTemplateData(graphTemplate)
  }, [graphTemplate])

  return (
    <Row>
      <Col lg={{ span: 20, offset: 2 }} sm={{ span: 24 }}>
        <Card>
          <Form
            layout='vertical'
            form={form}
            onFinish={handleFinish}
            initialValues={formInitialValues}
          >
            <FormItemLabel name='Endpoint name' />
            <Form.Item
              name='name'
              rules={[
                {
                  validator: (_, value, cb) => {
                    if (!value) {
                      cb('Please provide a endpoint name!');
                      return;
                    }
                    if (!/^[0-9a-zA-Z_]+$/.test(value)) {
                      cb(
                        'Endpoint name can only contain alphanumeric characters and underscores!'
                      );
                      return;
                    }
                    cb();
                  },
                },
              ]}
            >
              <Input
                placeholder='Example: allPayments'
                disabled={initialValues ? true : false}
              />
            </Form.Item>
            <FormItemLabel name="Endpoint type" />
            <Form.Item name="kind" rules={[{ required: true, message: 'Please select a endpoint type!' }]}>
              <RadioCards>
                <Radio.Button value={endpointTypes.INTERNAL}>Internal</Radio.Button>
                <Radio.Button value={endpointTypes.EXTERNAL}>External</Radio.Button>
                <Radio.Button value={endpointTypes.PREPARED}>Space Cloud</Radio.Button>
              </RadioCards>
            </Form.Item>
            <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") !== endpointTypes.PREPARED}>
              <FormItemLabel name='Method' />
              <Form.Item
                name='method'
                rules={[{ required: true, message: 'Please select a method!' }]}
              >
                <Select placeholder='Please select a method' style={{ width: 210 }}>
                  <Option value='POST'>POST</Option>
                  <Option value='PUT'>PUT</Option>
                  <Option value='GET'>GET</Option>
                  <Option value='DELETE'>DELETE</Option>
                </Select>
              </Form.Item>
              <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") === endpointTypes.INTERNAL}>
                <FormItemLabel name='Path' />
                <Form.Item
                  name='path'
                  rules={[{ required: true, message: 'Please provide path!' }]}
                >
                  <Input addonBefore={url} placeholder='Example: /v1/payments' />
                </Form.Item>
              </ConditionalFormBlock>
              <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") === endpointTypes.EXTERNAL}>
                <FormItemLabel name='External URL' />
                <Form.Item
                  name='path'
                  rules={[{ required: true, message: 'Please provide path!' }]}
                >
                  <Input placeholder='Example: https://example.com/foo' />
                </Form.Item>
              </ConditionalFormBlock>
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
            </ConditionalFormBlock>
            <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") === endpointTypes.PREPARED}>
              <Alert
                message={<AlertMsgPreparedQueries />}
                type='info'
                showIcon
                style={{ marginBottom: 21 }}
              />
              <FormItemLabel name="Template output format" description="Format for parsing the template output of GraphQL variables and response " />
              <Form.Item name="outputFormat">
                <Select style={{ width: 96 }}>
                  <Option value='yaml'>YAML</Option>
                  <Option value='json'>JSON</Option>
                </Select>
              </Form.Item>
              <FormItemLabel name="GraphQL query template" description="Template to generate the GraphQL query of Space Cloud" />
              <Form.Item style={{ border: "1px solid #D9D9D9", maxWidth: "600px" }}>
                <CodeMirror
                  value={graphTemplateData}
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
                    setGraphTemplateData(value);
                  }}
                />
              </Form.Item>
              <FormItemLabel name="GraphQL variables template" hint="(Optional)" description="Template to generate the variables of GraphQL request" />
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
                    autofocus: false,
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
                    autofocus: false,
                  }}
                  onBeforeChange={(editor, data, value) => {
                    setRuleData(value);
                  }}
                />
              </Form.Item>
            </ConditionalFormBlock>
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
                <FormItemLabel name='Override token' />
                <Form.Item name='overrideToken' valuePropName='checked'>
                  <Checkbox checked={token ? true : false}>
                    Override the token in the request to remote endpoint
              </Checkbox>
                </Form.Item>
                <ConditionalFormBlock
                  dependency='overrideToken'
                  condition={() => form.getFieldValue('overrideToken') === true}
                >
                  <FormItemLabel name='Token' />
                  <Input.Group compact style={{ display: "flex" }}>
                    <Form.Item
                      name="token"
                      style={{ flexGrow: 1 }}
                      rules={[{ required: true, message: 'Please provide a token!' }]}
                    >
                      <Input.Password placeholder="JWT Token" />
                    </Form.Item>
                    <Button onClick={() => setGenerateTokenModal(true)}>Generate Token</Button>
                  </Input.Group>
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") !== endpointTypes.PREPARED}>
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
                </ConditionalFormBlock>
              </Panel>
            </Collapse>
            <Button style={{ marginTop: 24 }} type='primary' htmlType='submit' block >{initialValues ? "Save" : "Add endpoint"}</Button>
          </Form>
        </Card>
      </Col>
      {generateTokenModal && (
        <GenerateTokenForm
          handleCancel={() => setGenerateTokenModal(false)}
          handleSubmit={(token) => form.setFieldsValue({ token })}
          secret={secret}
          initialToken={form.getFieldValue("token")}
        />
      )}
    </Row>
  );
};

export default EndpointForm;
