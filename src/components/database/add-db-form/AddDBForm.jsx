import React, { useState } from "react";
import './dbform.css';

import mysqlSmall from '../../../assets/mysqlSmall.svg'
import postgresqlSmall from '../../../assets/postgresSmall.svg'
import mongodbSmall from '../../../assets/mongoSmall.svg'
import { Modal, Form, Input, Select, Typography } from 'antd';
import { Controlled as CodeMirror } from 'react-codemirror2';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import 'codemirror/theme/material.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import { notify } from '../../../utils';

const { Text } = Typography;
const { Option } = Select;

const defaultRule = '{ "rule": "allow" }';

const EnableDBForm = ({ form, handleSubmit, handleCancel, visible }) => {
  const [selectedDb, setSelectedDb] = useState('postgres');
  const { getFieldDecorator } = form;
  const [rule, setRule] = useState(defaultRule);

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        try {
          handleSubmit();
          handleCancel();
        } catch (ex) {
          notify("error", "Error", ex.toString())
        }
      }
    })
  }

  return (
    <Modal
      title="Add a database"
      okText="Add"
      visible={visible}
      onCancel={handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" onSubmit={handleSubmitClick}>
        <FormItemLabel name="Select a database" />
        <Form.Item>
          {getFieldDecorator("db", {
            rules: [{ required: true, message: 'Please select a database' }],
          })(
            <>
              <Select
                style={{ width: 200 }}
                onChange={(e) => setSelectedDb(e)}
                placeholder="Select a database"
                className="action-rounded"
                defaultValue="postgres"
              >
                <Option value="mysql"><img src={mysqlSmall} alt="mySQL" className="drop-icon" />  MySQL</Option>
                <Option value="postgres"><img src={postgresqlSmall} alt="postgresSQl" className="drop-icon" /> PostgreSQL</Option>
                <Option value="mongo"><img src={mongodbSmall} alt="mongoDB" className="drop-icon" /> MongoDB</Option>
              </Select>
              <Input
                style={{ width: 200, marginLeft: 20 }}
                value={selectedDb}
                onChange={(e) => setSelectedDb(e.target.value)}
              >
              </Input><br />
              <Text style={{marginLeft: 225}} type="secondary">DB alias for your frontend</Text>
            </>
          )}
        </Form.Item>
        <FormItemLabel name="Connection string" />
        <Form.Item>
          {getFieldDecorator("conn", {
            rules: [{ required: true, message: 'Please provide a connection string!' }],
          })(
            <Input placeholder="Enter connection string of your database" />
          )}
        </Form.Item>
        <FormItemLabel name="Default rules" />
        <CodeMirror
          value={rule}
          className= "code-mirror"
          options={{
            mode: { name: "javascript", json: true },
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            tabSize: 2,
            autofocus: false
          }}
          onBeforeChange={(editor, data, value) => {
            setRule(value)
          }}
        />
      </Form>
    </Modal>
  );
}

export default Form.create({})(EnableDBForm);

