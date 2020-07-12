import React, { useState } from 'react';
import FormItemLabel from '../form-item-label/FormItemLabel';
import {
  Form,
  Select,
  Input,
  Alert,
  Checkbox,
  Drawer,
  Button,
  Row,
  Col,
  AutoComplete,
} from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import ConditionalFormBlock from '../conditional-form-block/ConditionalFormBlock';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { notify, dbIcons } from '../../utils';
import { generateSchemaAST } from '../../graphql';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FormItem from 'antd/lib/form/FormItem';
import ObjectAutoComplete from "../object-autocomplete/ObjectAutoComplete";
import { getCollectionSchema, getDbConfigs, getTrackedCollections } from '../../operations/database';
import { securityRuleGroups } from '../../constants';

const parseValue = (value, type) => {
  return (type === "number") ? parseNumber(value) : (type === "bool" ? parseBoolean(value) : value)
}

const parseBoolean = (value) => {
  if (value === "true") return true
  if (value === "false") return false
  return value
}

const parseNumber = (value) => {
  return !isNaN(value) ? Number(value) : value
}

const parseArray = (value, type) => {
  if (!value.includes(",")) {
    return value
  }
  return value.split(",").map(value => value.trim()).map(value => parseValue(value, type))
}

const rules = ['allow', 'deny', 'authenticated', 'match', 'remove', 'force', 'query', 'encrypt', 'decrypt', 'hash', 'and', 'or', 'webhook'];
const ConfigureRule = (props) => {
  // form
  const [form] = Form.useForm();

  // Router params
  const { projectID } = useParams();

  // Global state
  const projects = useSelector((state) => state.projects);

  // Component state
  const [selectedDb, setSelectedDb] = useState("");
  const [col, setCol] = useState('');
  const [findQuery, setFindQuery] = useState("{}");

  // Derived properties
  const { rule, type, f1, f2, error, fields, field, value, url } = props.selectedRule;
  const dbConfigs = useSelector(state => getDbConfigs(state))
  const dbList = Object.entries(dbConfigs).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias;
    return {
      alias: alias,
      dbtype: obj.type,
      svgIconSet: dbIcons(projects, projectID, alias),
    };
  });
  const data = useSelector(state => getTrackedCollections(state, selectedDb))
  const collectionSchemaString = useSelector(state => getCollectionSchema(state, props.ruleMetaData.group, props.ruleMetaData.id))

  // Handlers
  const handleSelectDatabase = (value) => setSelectedDb(value);
  const handleSearch = (value) => setCol(value);

  const onFinish = (values) => {
    switch (values.rule) {
      case "match":
        if (values.eval === 'in' || values.eval === 'notIn') {
          values.f2 = parseArray(values.f2, values.type)
        } else {
          values.f1 = parseValue(values.f1, values.type)
          values.f2 = parseValue(values.f2, values.type)
        }
        break;
      case "force":
        values.value = parseValue(values.value, values.type)
        delete values["type"]
        break;
      case "query":
        try {
          values.find = JSON.parse(findQuery);
        } catch (ex) {
          notify("error", "Error", ex.toString())
          return;
        }
        break;
      case "and":
      case "or":
        if (!props.selectedRule.clauses) values.clauses = [];
    }

    delete values.errorMsg;
    if (props.selectedRule.clause) values.clause = props.selectedRule.clause
    if (props.selectedRule.clauses) values.clauses = props.selectedRule.clauses
    props.onSubmit(values);
    props.closeDrawer();
  };

  // Autocomplete options
  let autoCompleteOptions = {};

  switch (props.ruleMetaData.ruleType) {
    case securityRuleGroups.DB_COLLECTIONS:
      const colSchemaFields = generateSchemaAST(collectionSchemaString)[props.ruleMetaData.id];
      const schemaFields = colSchemaFields.reduce((prev, curr) => Object.assign({}, prev, { [curr.name]: true }), {})
      switch (props.selectedNodeId) {
        case "create":
          autoCompleteOptions = { args: { op: true, auth: true, token: true, doc: schemaFields } }
          break;
        case "read":
          autoCompleteOptions = { args: { op: true, auth: true, token: true, find: schemaFields } }
          break;
        case "update":
          const update = {
            $set: schemaFields,
            $inc: schemaFields,
            $mul: schemaFields,
            $min: schemaFields,
            $max: schemaFields,
            $currentDate: schemaFields,
            $currentTimestamp: schemaFields
          }
          autoCompleteOptions = { args: { op: true, auth: true, token: true, find: schemaFields, update } }
          break;
        case "delete":
          autoCompleteOptions = { args: { op: true, auth: true, token: true, find: schemaFields } }
          break
      }
      break;
    case securityRuleGroups.FILESTORE:
    case securityRuleGroups.REMOTE_SERVICES:
    case securityRuleGroups.EVENTING:
    case securityRuleGroups.DB_PREPARED_QUERIES:
      autoCompleteOptions = { auth: true, params: true, token: true }
      break;
    case securityRuleGroups.INGRESS_ROUTES:
      const query = {
        path: true,
        pathArray: true,
        params: true,
        headers: true
      }
      autoCompleteOptions = { auth: true, params: true, query }
  }


  return (
    <Drawer
      title='Configure rule'
      placement='right'
      onClose={props.closeDrawer}
      visible={true}
      width={400}
    >
      <Form
        name='configure'
        form={form}
        onFinish={onFinish}
        initialValues={{
          rule,
          type,
          f1,
          eval: props.selectedRule.eval,
          f2,
          fields,
          field,
          value: value,
          url,
          errorMsg: error ? true : false,
          error
        }}
      >
        <FormItemLabel name='Rule Type' />
        <Form.Item name='rule'>
          <Select placeholder="Rule">
            {rules.map((val) => (
              <Select.Option key={val} value={val}>
                {val}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <ConditionalFormBlock
          dependency='rule'
          condition={() => form.getFieldValue('rule') === 'match'}
        >
          <FormItemLabel name='Operands data type' />
          <Form.Item name='type'>
            <Select placeholder="Data type">
              <Select.Option value='string'>String</Select.Option>
              <Select.Option value='number'>Number</Select.Option>
              <Select.Option value='bool'>Bool</Select.Option>
            </Select>
          </Form.Item>
          <FormItemLabel name='First operand' />
          <Form.Item name='f1'>
            <ObjectAutoComplete placeholder="First operand" options={autoCompleteOptions} />
          </Form.Item>
          <FormItemLabel name='Evaluation type' />
          <Form.Item name='eval'>
            <Select placeholder="Evaluation">
              <Select.Option value='=='>Equals to</Select.Option>
              <Select.Option value='!='>Not equals to</Select.Option>
              <Select.Option value='>'>Greater than</Select.Option>
              <Select.Option value='>='>Greater than equal to</Select.Option>
              <Select.Option value='<'>Lesser than</Select.Option>
              <Select.Option value='<='>Lesser than equal to</Select.Option>
              <Select.Option value='in'>In</Select.Option>
              <Select.Option value='notIn'>Not in</Select.Option>
            </Select>
          </Form.Item>
          <FormItemLabel name='Second operand' />
          <Form.Item name='f2'>
            <ObjectAutoComplete placeholder="Second operand" options={autoCompleteOptions} />
          </Form.Item>
          <Alert
            description={
              <div>
                You can use variables and helper functions inside operands
              </div>
            }
            type='info'
            showIcon
            style={{ marginBottom: 24 }}
          />
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency='rule'
          condition={() =>
            form.getFieldValue('rule') === 'encrypt' ||
            form.getFieldValue('rule') === 'decrypt' ||
            form.getFieldValue('rule') === "remove" ||
            form.getFieldValue('rule') === "hash"
          }
        >
          <FormItemLabel name='Fields to encrypt' />
          <Form.List name='fields'>
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map((field, index) => (
                    <Row key={field.key}>
                      <Col span={14}>
                        <Form.Item
                          name={[field.name]}
                          key={[field.name]}
                          rules={[
                            { required: true, message: 'Please enter column!' },
                          ]}
                        >
                          <ObjectAutoComplete placeholder="Field" options={autoCompleteOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <CloseOutlined
                          style={{ margin: '0 8px' }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() => {
                        add();
                      }}
                      style={{ width: '40%' }}
                    >
                      <PlusOutlined /> Add field
                    </Button>
                  </Form.Item>
                </>
              );
            }}
          </Form.List>
          <Alert
            description={<div>You can use variables inside fields</div>}
            type='info'
            showIcon
            style={{ marginBottom: 24 }}
          />
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency="rule"
          condition={() => form.getFieldValue('rule') === 'force'}
        >
          <FormItemLabel name="Field" />
          <FormItem name="field">
            <ObjectAutoComplete placeholder="Field" options={autoCompleteOptions} />
          </FormItem>
          <FormItemLabel name="Datatype" />
          <FormItem name="type">
            <Select placeholder="Data type">
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="bool">Bool</Select.Option>
            </Select>
          </FormItem>
          <FormItemLabel name="Value" />
          <FormItem name="value">
            <Input placeholder="Value" />
          </FormItem>
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency="rule"
          condition={() => form.getFieldValue('rule') === "webhook"}
        >
          <FormItemLabel name="URL" />
          <FormItem name="url">
            <Input placeholder="URL" />
          </FormItem>
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency='rule'
          condition={() => form.getFieldValue('rule') === 'query'}
        >
          <FormItemLabel name='Database' />
          <Form.Item
            name='db'
            rules={[{ required: true, message: 'Please select a database!' }]}
          >
            <Select
              placeholder='Select a database'
              onSelect={handleSelectDatabase}
            >
              {dbList.map((alias) => (
                <Select.Option value={alias.alias} key={alias.alias}>
                  <img src={alias.svgIconSet} style={{ marginRight: 10 }} />
                  {alias.alias}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <FormItemLabel name='Collection / Table name' />
          <Form.Item name='col'>
            <AutoComplete
              placeholder='Collection / Table name'
              onSearch={handleSearch}
            >
              {data
                .filter(
                  (data) =>
                    data.toLowerCase().indexOf(col.toLowerCase()) !== -1
                )
                .map((data) => (
                  <AutoComplete.Option key={data} value={data}>
                    {data}
                  </AutoComplete.Option>
                ))}
            </AutoComplete>
          </Form.Item>
          <FormItemLabel name='Find query' />
          <div style={{ border: '1px solid #D9D9D9', marginBottom: 24 }}>
            <CodeMirror
              style={{ border: '1px solid #D9D9D9' }}
              value={findQuery}
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
                setFindQuery(value);
              }}
            />
          </div>
        </ConditionalFormBlock>
        <FormItemLabel name='Customize error message' />
        <Form.Item name='errorMsg' valuePropName='checked'>
          <Checkbox checked={error ? true : false}>
            Customize the error message sent to client if the rule fails
          </Checkbox>
        </Form.Item>
        <ConditionalFormBlock
          dependency='errorMsg'
          condition={() => form.getFieldValue('errorMsg') === true}
        >
          <FormItemLabel name='Error message' />
          <Form.Item name='error'>
            <Input placeholder="Error message" />
          </Form.Item>
        </ConditionalFormBlock>
        <span style={{ float: 'right' }}>
          <Button style={{ marginRight: 16 }} onClick={() => props.closeDrawer()}>Cancel</Button>
          <Button type='primary' htmlType='submit'>
            Save
          </Button>
        </span>
      </Form>
    </Drawer>
  );
};

export default ConfigureRule;
