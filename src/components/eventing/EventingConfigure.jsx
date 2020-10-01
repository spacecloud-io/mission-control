import React from "react";
import { AutoComplete, Button, Form, Checkbox } from "antd";
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";

const EventingConfigure = ({
  initialValues,
  handleSubmit,
  dbList,
  loading,
}) => {
  const [form] = Form.useForm();
  const handleSubmitClick = (e) => {
    form.validateFields().then((values) => {
      handleSubmit(values);
    });
  };

  if (!loading) {
    form.setFieldsValue(initialValues);
  }

  return (
    <Form form={form}>
      <Form.Item name="enabled" valuePropName="checked">
        <Checkbox>Enable eventing module</Checkbox>
      </Form.Item>
      <ConditionalFormBlock
        dependency="enabled"
        condition={() => form.getFieldValue("enabled")}
      >
        <Form.Item
          name="dbAlias"
          rules={[{ required: true, message: "Database is required!" }]}
        >
          <AutoComplete
            placeholder="Choose an eventing database"
            style={{ width: 320 }}
            options={dbList.map((db) => ({ value: db }))}
          />
        </Form.Item>
      </ConditionalFormBlock>
      <Form.Item>
        <Button onClick={handleSubmitClick}>Save</Button>
      </Form.Item>
    </Form>
  );
};

export default EventingConfigure;
