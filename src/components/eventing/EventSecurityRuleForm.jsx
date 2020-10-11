import React, { useState } from "react";
import { Modal, AutoComplete, Form } from "antd";
import FormItemLabel from "../form-item-label/FormItemLabel";
import { defaultEventRule } from "../../constants";
import { notify, isJson } from "../../utils";
import JSONCodeMirror from "../json-code-mirror/JSONCodeMirror";

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

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      try {
        handleSubmit(values.eventType, JSON.parse(values.rules))
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
        <Form layout="vertical" form={form} onFinish={handleSubmitClick} initialValues={{ rules: JSON.stringify(initialValues.rules, null, 2) }} onValuesChange={handleChangedValue}>
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
            <Form.Item name="rules" rules={[{ required: true }, {
              validateTrigger: "onBlur",
              validator: (_, value, cb) => {
                if (value && !isJson(value)) {
                  cb("Please provide a valid JSON object!")
                  return
                }
                cb()
              }
            }]}>
              <JSONCodeMirror />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EventSecurityRuleForm;
