import React, { useState } from "react";
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, AutoComplete } from "antd";
import { Controlled as CodeMirror } from "react-codemirror2";
import FormItemLabel from "../form-item-label/FormItemLabel";
import "codemirror/theme/material.css";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/selection/active-line.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/edit/closebrackets.js";
import { defaultEventRule } from "../../constants";
import { notify } from "../../utils";

const EventSecurityRuleForm = ({
  form,
  handleSubmit,
  handleCancel,
  initialValues,
  conformLoading,
  defaultRules,
  customEventTypes
}) => {
  const { getFieldDecorator, getFieldValue } = form;

  const eventType = getFieldValue("eventType");

  if (!initialValues) {
    initialValues = {
      rules:
        Object.keys(defaultRules).length > 0 ? defaultRules : defaultEventRule
    };
  }

  const [rule, setRule] = useState(
    JSON.stringify(initialValues.rules, null, 2)
  );

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        try {
          handleSubmit(values.eventType, JSON.parse(rule));
        } catch (ex) {
          notify("error", "Error", ex.toString());
        }
      }
    });
  };

  return (
    <div>
      <Modal
        className="edit-item-modal"
        visible={true}
        width={520}
        okText="Add"
        title="Add rule"
        onOk={handleSubmitClick}
        confirmLoading={conformLoading}
        onCancel={handleCancel}
      >
        <Form layout="vertical" onSubmit={handleSubmitClick}>
          <FormItemLabel name="Event Type" />
          <Form.Item>
            {getFieldDecorator("eventType", {
              rules: [
                { required: true, message: "Please provide a event type!" }
              ]
            })(
              <AutoComplete
                placeholder="Example: event-type"
              >
                {customEventTypes.filter(value => eventType ? (value.toLowerCase().includes(eventType.toLowerCase())) : true).map(type => (
                  <AutoComplete.Option key={type}>{type}</AutoComplete.Option>
                ))}
              </AutoComplete>
            )}
          </Form.Item>
          <div>
            <FormItemLabel name="Rule" />
            <CodeMirror
              value={rule}
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
                setRule(value);
              }}
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Form.create({})(EventSecurityRuleForm);
