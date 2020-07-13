import React from "react";
import { Form, Input, Select, Button, Row, Col } from "antd"
import { DeleteOutlined } from '@ant-design/icons';
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";

const { Option } = Select

function Headers({ handleSubmit, headers, loading }) {
  const [form] = Form.useForm();

  const handleSubmitClick = (values) => {
    handleSubmit(values.headers)
  }

  if (!loading) {
    form.setFieldsValue({ headers: headers ? headers : [] })
  }

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmitClick}>
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
                      <Button
                        onClick={() => remove(field.name)}
                        style={{ marginRight: "2%", float: "left" }}>
                        <DeleteOutlined />
                      </Button>
                    </Col>
                  </Row>
                </React.Fragment>
              ))}
              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type='link'
                  style={{
                    padding: 0,
                    marginTop: -10,
                    color: 'rgba(0, 0, 0, 0.6)',
                  }}
                  onClick={() => {
                    const fieldKeys = [
                      ...fields.map(obj => ["headers", obj.name, "op"]),
                      ...fields.map(obj => ["headers", obj.name, "key"]),
                      ...fields.map(obj => ["headers", obj.name, "value"]),
                    ]
                    form.validateFields(fieldKeys)
                      .then(() => add())
                      .catch(ex => console.log("Exception", ex))
                  }}
                >
                  <span
                    className='material-icons'
                    style={{ position: 'relative', top: 5, marginRight: 5 }}
                  >
                    add_circle
                    </span>
                    Add modification
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>
      <Form.Item>
        <Button htmlType="submit">Save</Button>
      </Form.Item>
    </Form>
  )
}

export default Headers