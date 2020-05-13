import React, { useState, useEffect } from 'react';
import './endpoint-form.css';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'automate-redux';
import { getProjectConfig, notify } from '../../../utils';
import ReactGA from 'react-ga';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Input, Select, Form, Collapse, Checkbox, Alert } from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import GenerateTokenForm from '../../explorer/generateToken/GenerateTokenForm';
import { Controlled as CodeMirror } from 'react-codemirror2';
import {defaultEndpointRule} from "../../../constants";
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import { CaretRightOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Panel } = Collapse;


const EndpointForm = (props) => {
  // Router params
  const { projectID, serviceName } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const projects = useSelector((state) => state.projects);

  const { name, path, method, rule, token, template } = props.initialValues ? props.initialValues : {}
  const initialRule = rule ? rule : defaultEndpointRule
  const initialTemplate = template ? template : {}
  const [ruleData, setRuleData] = useState(JSON.stringify(initialRule, null, 2));
  const [templateData, setTemplateData] = useState(JSON.stringify(initialTemplate, null, 2));
  const [templateType, setTemplateType] = useState('YAML');
  const [generateTokenModal, setGenerateTokenModal] = useState(false);

  const [form] = Form.useForm();
  const url = getProjectConfig(
    projects,
    projectID,
    `modules.remoteServices.externalServices.${serviceName}.url`
  );

  const secret = getProjectConfig(projects, projectID, `secrets`);

  useEffect(() => {
    ReactGA.pageview('/projects/remote-services');
  }, []);

  const handleSubmit = (e) => {
    form.validateFields().then((values) => {
      try {
        props.handleSubmit(values.name, values.method, values.path, JSON.parse(ruleData), values.token, values.transform_body ? JSON.parse(templateData) : undefined);
        form.resetFields();
        history.goBack();
      } catch (ex) {
        notify('error', 'Error', ex.toString());
      }
    });
  };

  // Handlers

  const alertMsg = (
    <div>
      Info <br />
      Describe the desired request body either in YAML or JSON using the Go
      templates. Space Cloud will execute the specified{' '}
      <a href='#' style={{ color: '#7EC6FF' }}>
        <b>Go template</b>
      </a>{' '}
      and generate the request body for the remote endpoint. Read more about{' '}
      <a href='#' style={{ color: '#7EC6FF' }}>
        <b>transforming the request</b>
      </a>{' '}
      in docs.
    </div>
  );

  return (
    <div className='add-endpoint-container'>
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
        initialValues={{
              name: name,
              method: method ? method : 'POST',
              path: path,
              override_token: token ? true : false,
              token: token,
              transform_body: template ? true : false
            }}
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
            disabled={props.initialValues ? true : false}
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
        <CodeMirror
          value={ruleData}
          className='add-endpoint-codemirror'
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
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          className='site-collapse-custom-collapse'
        >
          <Panel
            header='Advanced'
            key='1'
            className='site-collapse-custom-panel'
          >
            <FormItemLabel name='Override token' />
            <Form.Item name='override_token' valuePropName='checked'>
              <Checkbox checked={token ? true : false}>
                Override the token in the request to remote endpoint
              </Checkbox>
            </Form.Item>
            <ConditionalFormBlock
              dependency='override_token'
              condition={() => form.getFieldValue('override_token') === true}
            >
              <FormItemLabel name='Token' />
              <Form.Item
                name='token'
                rules={[{ required: true, message: 'Please provide a token!' }]}
              >
                <Input
                  suffix={
                    <Button
                      style={{ marginRight: -12 }}
                      onClick={() => setGenerateTokenModal(true)}
                    >
                      Generate Token
                    </Button>
                  }
                />
              </Form.Item>
            </ConditionalFormBlock>
            <FormItemLabel name='Transform body' />
            <Form.Item name='transform_body' valuePropName='checked'>
              <Checkbox checked={template ? true : false}>
                Transform the request body before making request to the remote
                endpoint
              </Checkbox>
            </Form.Item>
            <ConditionalFormBlock
              dependency='transform_body'
              condition={() => form.getFieldValue('transform_body') === true}
            >
              <Alert
                message={alertMsg}
                type='info'
                showIcon
                style={{ marginBottom: 21 }}
              />
              <FormItemLabel
                name={
                  <span>
                    Request body template
                    <span
                      style={{
                        color: '#a9a9a9',
                        fontSize: 14,
                        marginLeft: 10,
                      }}
                    >
                      (Go template)
                    </span>
                    <Select
                      style={{ width: 96, float: 'right' }}
                      defaultValue={templateType}
                      onChange={(val) => setTemplateType(val)}
                    >
                      <Option value='YAML'>YAML</Option>
                      <Option value='JSON'>JSON</Option>
                    </Select>
                  </span>
                }
              />
              <CodeMirror
                value={templateData}
                className='add-endpoint-codemirror'
                options={{
                  mode: { name: 'javascript', yaml: templateType === "YAML", json: templateType === 'JSON' },
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
            </ConditionalFormBlock>
          </Panel>
        </Collapse>
        <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
          Save
        </Button>
      </Form>
      {generateTokenModal && (
        <GenerateTokenForm
          handleCancel={() => setGenerateTokenModal(false)}
          handleSubmit={(token) => form.setFieldsValue({ token })}
          secret={secret[0].secret}
        />
      )}
    </div>
  );
};

export default EndpointForm;
