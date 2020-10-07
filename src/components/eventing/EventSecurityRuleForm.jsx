import React, { useState } from "react";
import { Modal, AutoComplete, Form } from "antd";
import { Controlled as CodeMirror } from "react-codemirror2";
import FormItemLabel from "../form-item-label/FormItemLabel";
import "codemirror/theme/material.css";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/selection/active-line.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/edit/closebrackets.js";
import 'codemirror/addon/lint/json-lint.js';
import 'codemirror/addon/lint/lint.js';
import { defaultEventRule } from "../../constants";
import { notify } from "../../utils";

const EventSecurityRuleForm = ({
  handleSubmit,
  handleCancel,
  initialValues,
  defaultRules,
  customEventTypes
}) => {
  const [form] = Form.useForm();
  const [eventType, setEventType] = useState()

  const handleChangedValue = ({ eventType }) => {
    setEventType(eventType)
  }

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
    form.validateFields().then(values => {
      try {
        handleSubmit(values.eventType, JSON.parse(rule))
        .then(() => handleCancel())
      } catch (ex) {
        notify("error", "Error", ex.toString());
      }
    });
  }

  return (
    <div>
      <Modal
        className="edit-item-modal"
        visible={true}
        width={520}
        okText="Add"
        title="Add rule"
        onOk={handleSubmitClick}
        onCancel={handleCancel}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmitClick} onValuesChange={handleChangedValue}>
          <FormItemLabel name="Event Type" />
          <Form.Item name="eventType" rules={[
                { required: true, message: "Please provide a event type!" }
              ]}>
              <AutoComplete
                placeholder="Example: event-type"
              >
                {customEventTypes.filter(value => eventType ? (value.toLowerCase().includes(eventType.toLowerCase())) : true).map(type => (
                  <AutoComplete.Option key={type}>{type}</AutoComplete.Option>
                ))}
              </AutoComplete>
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
                autofocus: false,
                gutters: ['CodeMirror-lint-markers'],
                lint: true
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

export default EventSecurityRuleForm;
