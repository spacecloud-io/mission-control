import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getProjectConfig, notify, getJWTSecret } from '../../../utils';
import { Row, Col, Button, Input, Select, Form, Collapse, Checkbox, Alert, Card } from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import GenerateTokenForm from '../../explorer/generateToken/GenerateTokenForm';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { defaultEndpointRule } from "../../../constants";
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import { CaretRightOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;

function AlertMsg() {
  return (
    <div>
      <b>Info</b> <br />
      Describe the desired request body either in YAML or JSON using the <a href='https://golang.org/pkg/text/template/' style={{ color: '#7EC6FF' }}>
        <b>Go templates</b>
      </a>. Space Cloud will execute the specified Go template
      and generate the request body for the remote endpoint. Read more about
      <a href='https://docs.spaceuptech.com/microservices/graphql/transforming-request' style={{ color: '#7EC6FF' }}>
        <b>transforming the request</b>
      </a> in docs.
    </div>
  );
}

const EndpointForm = ({ initialValues, handleSubmit }) => {
  // Router params
  const { projectID, serviceName } = useParams();
  const projects = useSelector((state) => state.projects);

  const { name, path, method, rule, token, template, outputFormat } = initialValues ? initialValues : {}
  const initialRule = rule ? rule : defaultEndpointRule
  const [ruleData, setRuleData] = useState(JSON.stringify(initialRule, null, 2));
  const [templateData, setTemplateData] = useState(template);
  const [generateTokenModal, setGenerateTokenModal] = useState(false);

  const [form] = Form.useForm();
  const url = getProjectConfig(
    projects,
    projectID,
    `modules.remoteServices.externalServices.${serviceName}.url`
  );

  const secret = useSelector(state => getJWTSecret(state, projectID))

  const formInitialValues = {
    name: name,
    method: method ? method : "POST",
    path: path,
    overrideToken: token ? true : false,
    token: token,
    transformBody: template ? true : false,
    template: template,
    outputFormat: outputFormat ? outputFormat : "yaml"
  }

  const handleFinish = ({ name, method, path, token, transformBody, overrideToken, outputFormat }) => {
    try {
      handleSubmit(
        name,
        method,
        path,
        JSON.parse(ruleData),
        overrideToken ? token : undefined,
        transformBody ? "transform-go" : "simple",
        transformBody ? templateData : undefined,
        transformBody ? outputFormat : undefined
      )
    } catch (error) {
      notify("error", "Error", error)
    }
  };

  useEffect(() => {
    form.setFieldsValue(formInitialValues)
  }, [formInitialValues.path])

  return (
    <Row>
      <Col lg={{ span: 16, offset: 4 }} sm={{ span: 24 }}>
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
            <FormItemLabel name='Path' />
            <Form.Item
              name='path'
              rules={[{ required: true, message: 'Please provide path!' }]}
            >
              <Input addonBefore={url} placeholder='Example: /v1/payments' />
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
                <FormItemLabel name='Transform body' />
                <Form.Item name='transformBody' valuePropName='checked'>
                  <Checkbox checked={template ? true : false}>
                    Transform the request body before making request to the remote
                    endpoint
                  </Checkbox>
                </Form.Item>
                <ConditionalFormBlock
                  dependency='transformBody'
                  condition={() => form.getFieldValue('transformBody') === true}
                >
                  <Alert
                    message={<AlertMsg />}
                    type='info'
                    showIcon
                    style={{ marginBottom: 21 }}
                  />
                  <FormItemLabel
                    name="Request body template"
                    hint="(Go template)"
                    extra={
                      <Form.Item name="outputFormat">
                        <Select style={{ width: 96, float: 'right' }}>
                          <Option value='yaml'>YAML</Option>
                          <Option value='json'>JSON</Option>
                        </Select>
                      </Form.Item>
                    }
                  />
                  <Form.Item shouldUpdate={(prev, curr) => prev.outputFormat !== curr.outputFormat}>
                    {() => {
                      const outputFormat = form.getFieldValue("outputFormat")
                      return (
                        <CodeMirror
                          value={templateData}
                          options={{
                            mode: { name: 'javascript', yaml: outputFormat === "yaml", json: outputFormat === 'json' },
                            lineNumbers: true,
                            styleActiveLine: true,
                            matchBrackets: true,
                            autoCloseBrackets: true,
                            tabSize: 2,
                            autofocus: true,
                          }}
                          onBeforeChange={(editor, data, value) => {
                            setTemplateData(value);
                          }}
                        />
                      )
                    }}
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
          secret={secret}
          initialToken={form.getFieldValue("token")}
        />
      )}
    </Row>
  );
};

export default EndpointForm;
