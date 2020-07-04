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
import { notify, getProjectConfig, dbIcons } from '../../utils';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FormItem from 'antd/lib/form/FormItem';

const ConfigureRule = (props) => {
  const [form] = Form.useForm();
  const [selectedDb, setSelectedDb] = useState();
  const [col, setCol] = useState('');
  const [findQuery, setFindQuery] = useState("{}");
  const { projectID } = useParams();

  const projects = useSelector((state) => state.projects);
  const { rule, type, f1, f2, error, fields, field, value, url } = props.selectedRule;
  console.log(props.selectedRule)

  const dbModuleFetch = getProjectConfig(projects, projectID, 'modules.db', {});
  const dbList = Object.entries(dbModuleFetch).map(([alias, obj]) => {
    if (!obj.type) obj.type = alias;
    return {
      alias: alias,
      dbtype: obj.type,
      svgIconSet: dbIcons(projects, projectID, alias),
    };
  });

  const collections = getProjectConfig(
    projects,
    projectID,
    `modules.db.${selectedDb}.collections`,
    {}
  );
  const trackedCollections = Object.keys(collections);
  const data = trackedCollections.filter(
    (name) =>
      name !== 'default' && name !== 'event_logs' && name !== 'invocation_logs'
  );

  const rules = [
    'allow',
    'deny',
    'authenticated',
    'match',
    'remove',
    'force',
    'query',
    'encrypt',
    'decrypt',
    'hash',
    'and',
    'or',
    'webhook',
  ];

  const onFinish = (values) => {
    if (values.rule === 'match') {
      // Datatype
      if (values.type === 'number') {
        if (/\d/.test(values.f1)) {
          values.f1 = parseInt(values.f1);
        } else if (/\d/.test(values.f2)) {
          values.f2 = parseInt(values.f2);
        } else {
          notify('error', 'Error', 'No number literal in either operand');
          return;
        }
      } else if (values.type === 'bool') {
        if (values.f1.toLowerCase() === 'true') {
          values.f1 = true;
        } else if (values.f2.toLowerCase() === 'false') {
          values.f2 = false;
        } else {
          notify('error', 'Error', 'No boolean present in either operand');
          return;
        }
      }
      // eval
      if (values.eval === 'in' || values.eval === 'notIn') {
        if (values.f1.includes(',')) {
          values.f1 = values.f1.split(',');
        } else if (values.f2.includes(',')) {
          values.f2 = values.f2.split(',');
        } else {
          notify('error', 'Error', 'No CSV found in either operand');
          return;
        }
      }
    }
    else if (values.rule === 'force') {
      // Datatype
     if (values.type === 'number') {
        if (/\d/.test(values.value)) {
          values.value = parseInt(values.value);
        } else {
          notify('error', 'Error', 'No number literal in value field');
          return;
        }
      } else if (values.type === 'bool') {
        if (!typeof values.value === "string") {
          notify('error', 'Error', 'No boolean present in value field');
          return;
        }
        else if (values.value.toLowerCase() === 'true') {
          values.value = true;
        } else if (values.value.toLowerCase() === 'false') {
          values.value = false;
        } else {
          notify('error', 'Error', 'No boolean present in value field');
          return;
        }
      }
    }
    else if (values.rule === 'query') {
      try {
        values.find = JSON.parse(findQuery);
      } catch(ex) {
        notify("error", "Error", ex.toString())
        return;
      }
    }
    else if (values.rule === 'and' || values.rule === 'or') {
      values.clauses = [];
    }
    delete values.errorMsg;
    props.onSubmit(values);
    props.closeDrawer();
  };

  const handleSelectDatabase = (value) => setSelectedDb(value);
  const handleSearch = (value) => setCol(value);

  return (
    <Drawer
      title='Configure rule'
      placement='right'
      onClose={props.closeDrawer}
      visible={props.drawer}
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
            <Input placeholder="First operand"/>
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
          <ConditionalFormBlock
            dependency='eval'
            condition={() =>
              form.getFieldValue('eval') === 'in' ||
              form.getFieldValue('eval') === 'notIn'
            }
          >
            <Alert
              description={<div>One of the operand must be CSV</div>}
              type='info'
              showIcon
              style={{ marginBottom: 24 }}
            />
          </ConditionalFormBlock>
          <FormItemLabel name='Second operand' />
          <Form.Item name='f2'>
            <Input placeholder="Second operand"/>
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
                          <Input placeholder='Field' />
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
          <FormItemLabel name="Field"/>
          <FormItem name="field">
            <Input placeholder="Field"/>
          </FormItem>
          <FormItemLabel name="Datatype" />
          <FormItem name="type">
            <Select placeholder="Data type">
              <Select.Option value="string">String</Select.Option>
              <Select.Option value="number">Number</Select.Option>
              <Select.Option value="bool">Bool</Select.Option>
            </Select>
          </FormItem>
          <FormItemLabel name="Value"/>
          <FormItem name="value">
            <Input placeholder="Value"/>
          </FormItem>
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency="rule"
          condition={() => form.getFieldValue('rule') === "webhook"}
        >
          <FormItemLabel name="URL"/>
          <FormItem name="url">
            <Input placeholder="URL"/>
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
            <Input placeholder="Error message"/>
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
