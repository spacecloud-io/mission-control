import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { canGenerateToken } from '../../../utils';
import { Row, Col, Button, Input, Select, Form, Collapse, Checkbox, Alert, Card, Radio, Tooltip, InputNumber } from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import GenerateTokenForm from '../../explorer/generateToken/GenerateTokenForm';
import { defaultEndpointRule, endpointTypes } from "../../../constants";
import { CaretRightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import RadioCards from "../../radio-cards/RadioCards";
import AntCodeMirror from "../../ant-code-mirror/AntCodeMirror";
import ObjectAutoComplete from "../../object-autocomplete/ObjectAutoComplete";

const { Option } = Select;
const { Panel } = Collapse;

function AlertMsgApplyTransformations() {
  return (
    <div>
      <b>Info</b> <br />
      Describe the transformed claims/request/response body using <a href='https://golang.org/pkg/text/template/' style={{ color: '#7EC6FF' }}>
        <b>Go templates</b>
      </a>. Space Cloud will execute the specified template to generate the new claims/request/response.
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

function AlertMsgCacheOptions() {
  return (
    <div>
      <b>Note:</b> <br />
      Service and endpoint id will always be included in the caching key. Specify the other parameters (e.g. a token claim) below, that needs to be included in the caching key.
    </div>
  );
}

const EndpointForm = ({ initialValues, handleSubmit, serviceURL, isCachingEnabled }) => {
  // Router params
  const { projectID } = useParams();

  const { kind = endpointTypes.INTERNAL, name, requestPayloadFormat, path, method, rule, token, claims, requestTemplate, responseTemplate, graphTemplate, outputFormat, headers = [], timeout, cacheOptions = [] } = initialValues ? initialValues : {}
  const [generateTokenModal, setGenerateTokenModal] = useState(false);
  const generateTokenAllowed = useSelector(state => canGenerateToken(state, projectID))

  const [form] = Form.useForm();

  const initialCacheOptions = cacheOptions ? cacheOptions.filter(item => item !== "args.url") : []

  const formInitialValues = {
    kind: kind,
    name: name,
    requestPayloadFormat: requestPayloadFormat ? requestPayloadFormat : "json",
    method: method ? method : "POST",
    path: path,
    timeout: timeout,
    overrideToken: token ? true : false,
    token: token,
    setHeaders: headers && headers.length > 0 ? true : false,
    headers: headers && headers.length > 0 ? headers.map(obj => Object.assign({}, obj, { op: obj.op ? obj.op : "set" })) : [{ op: "set", key: "", value: "" }],
    applyTransformations: (requestTemplate || responseTemplate || claims) ? true : false,
    outputFormat: outputFormat ? outputFormat : "yaml",
    claims: claims ? claims : undefined,
    graphTemplate: graphTemplate ? graphTemplate : undefined,
    requestTemplate: requestTemplate ? requestTemplate : undefined,
    responseTemplate: responseTemplate ? responseTemplate : undefined,
    cacheOptions: initialCacheOptions
  }

  const handleFinish = (values) => {
    const overrideToken = values.overrideToken
    values = Object.assign({}, formInitialValues, values)
    const { kind, name, requestPayloadFormat, method, path, token, claims, applyTransformations, outputFormat, headers, setHeaders, timeout, requestTemplate, responseTemplate, graphTemplate, cacheOptions = [] } = values
    const result = {
      kind,
      name,
      requestPayloadFormat: kind === endpointTypes.PREPARED ? "json" : requestPayloadFormat,
      method,
      path,
      rule: rule && Object.keys(rule).length > 0 ? rule : defaultEndpointRule,
      timeout,
      token: overrideToken ? token : undefined,
      headers: setHeaders ? headers : undefined,
      template: "go",
      outputFormat: outputFormat,
      claims: claims ? claims : undefined,
      requestTemplate: (applyTransformations || kind === endpointTypes.PREPARED) ? requestTemplate : undefined,
      responseTemplate: (applyTransformations || kind === endpointTypes.PREPARED) ? responseTemplate : undefined,
      graphTemplate: endpointTypes.PREPARED ? graphTemplate : undefined,
      cacheOptions: cacheOptions && cacheOptions.length > 0 ? [...new Set([...cacheOptions, "args.url"])] : ["args.url"]
    }

    handleSubmit(result)
  };

  useEffect(() => {
    form.setFieldsValue(formInitialValues)
  }, [formInitialValues.kind, formInitialValues.path])

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
              <Alert type="info" showIcon 
              style={{ width: '50%', marginTop: '16px' }}
              message='Once an endpoint name added, It cannot be changed later' />
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
              <Row gutter={[32]}>
                <Col>
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
                </Col>
                <Col>
                  <FormItemLabel name="Payload format" />
                  <Form.Item name="requestPayloadFormat" rules={[{ required: true, message: 'Please select a request payload format!' }]}>
                    <Select placeholder="Request payload format" style={{ width: 210 }}>
                      <Select.Option value="json">JSON</Select.Option>
                      <Select.Option value="form-data">Form data</Select.Option>
                    </Select>
                  </Form.Item> 
                </Col>
              </Row>
              <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") === endpointTypes.INTERNAL}>
                <FormItemLabel name='Path' />
                <Form.Item
                  name='path'
                  rules={[{ required: true, message: 'Please provide path!' }]}
                >
                  <Input addonBefore={serviceURL} placeholder='Example: /v1/payments' />
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
              <Form.Item name="graphTemplate">
                <AntCodeMirror style={{ border: "1px solid #D9D9D9" }} options={{
                  mode: { name: 'go' },
                  lineNumbers: true,
                  styleActiveLine: true,
                  matchBrackets: true,
                  autoCloseBrackets: true,
                  tabSize: 2
                }} />
              </Form.Item>
              <FormItemLabel name="GraphQL variables template" hint="(Optional)" description="Template to generate the variables of GraphQL request" />
              <Form.Item name="requestTemplate">
                <AntCodeMirror style={{ border: "1px solid #D9D9D9" }} options={{
                  mode: { name: 'go' },
                  lineNumbers: true,
                  styleActiveLine: true,
                  matchBrackets: true,
                  autoCloseBrackets: true,
                  tabSize: 2
                }} />
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
                <ConditionalFormBlock
                  shouldUpdate={true}
                  condition={() => isCachingEnabled}
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
                <FormItemLabel name="Timeout" description="Applicable for REST endpoints only" hint="(default: 60)" />
                <Form.Item name="timeout">
                  <InputNumber style={{ width: 200 }} placeholder="Timeout in seconds" />
                </Form.Item>
                <ConditionalFormBlock
                  dependency="overrideToken"
                  condition={() => form.getFieldValue("overrideToken") === true}
                >
                  <FormItemLabel name='Override token' />
                  <Form.Item name='overrideToken' valuePropName='checked'>
                    <Checkbox>
                      Override the token in the request to remote endpoint
                  </Checkbox>
                  </Form.Item>
                  <Input.Group compact style={{ display: "flex" }}>
                    <Form.Item
                      name="token"
                      style={{ flexGrow: 1 }}
                      rules={[{ required: true, message: 'Please provide a token!' }]}
                    >
                      <Input.Password placeholder="JWT Token" />
                    </Form.Item>
                    <Tooltip title={generateTokenAllowed ? "" : "You are not allowed to perform this action. This action requires modify permissions on project config"}>
                      <Button disabled={!generateTokenAllowed} onClick={() => setGenerateTokenModal(true)}>Generate Token</Button>
                    </Tooltip>
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
                    condition={() => form.getFieldValue('setHeaders') === true}>
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
                                      </Button>
                                    }
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
                </ConditionalFormBlock>
                <FormItemLabel name='Apply transformations' />
                <Form.Item name='applyTransformations' valuePropName='checked'>
                  <Checkbox>
                    Transform the claims, request and response using templates
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
                  <FormItemLabel name="JWT claims template" hint="(Optional)" description="Template to generate the transformed JWT claims of the request. Keep it empty to skip transforming the JWT claims." />
                  <Form.Item name="claims">
                    <AntCodeMirror style={{ border: "1px solid #D9D9D9" }} options={{
                      mode: { name: 'go' },
                      lineNumbers: true,
                      styleActiveLine: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      tabSize: 2
                    }} />
                  </Form.Item>
                  <ConditionalFormBlock dependency="kind" condition={() => form.getFieldValue("kind") !== endpointTypes.PREPARED}>
                    <FormItemLabel name="Request body template" hint="(Optional)" description="Template to generate the transformed request body. Keep it empty to skip transforming the request body." />
                    <Form.Item name="requestTemplate" >
                      <AntCodeMirror style={{ border: "1px solid #D9D9D9" }} options={{
                        mode: { name: 'go' },
                        lineNumbers: true,
                        styleActiveLine: true,
                        matchBrackets: true,
                        autoCloseBrackets: true,
                        tabSize: 2
                      }} />
                    </Form.Item>
                  </ConditionalFormBlock>
                  <FormItemLabel name="Response body template" hint="(Optional)" description="Template to generate the transformed response body. Keep it empty to skip transforming the response body." />
                  <Form.Item name="responseTemplate">
                    <AntCodeMirror style={{ border: "1px solid #D9D9D9" }} options={{
                      mode: { name: 'go' },
                      lineNumbers: true,
                      styleActiveLine: true,
                      matchBrackets: true,
                      autoCloseBrackets: true,
                      tabSize: 2
                    }} />
                  </Form.Item>
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
          projectID={projectID}
          initialToken={form.getFieldValue("token")}
        />
      )}
    </Row>
  );
};

export default EndpointForm;
