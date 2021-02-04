import React from "react"
import { Modal, Input, Form, Row, Col, Button } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"
import { MinusCircleFilled, PlusOutlined } from "@ant-design/icons";

const FunctionForm = ({ handleSubmit, handleCancel, initialValues }) => {
  const [form] = Form.useForm();

  const onSubmit = e => {
    form.validateFields().then(values => {
      handleSubmit(values).then(() => {
        handleCancel();
        form.resetFields();
      })
    });
  }

  const formInitialValues = initialValues ? initialValues : { variables: [""] }

  return (
    <Modal
      title={`${initialValues ? "Edit" : "Add"} security function`}
      okText={initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={handleCancel}
      onOk={onSubmit}
    >
      <Form layout="vertical" form={form} onFinish={onSubmit} initialValues={formInitialValues}>
        <FormItemLabel name="Function name" />
        <Form.Item name="id" rules={[{ required: true, message: "Please enter function name!" }]}>
          <Input placeholder="e.g. create" disabled={initialValues ? true : false} />
        </Form.Item>
        <FormItemLabel name="Variables" />
        <Form.List name="variables">
          {(fields, { add, remove }) => (
            <div>
              {fields.map((field => (
                <Row key={field.key} gutter={24}>
                  <Col span={20}>
                    <Form.Item
                      {...field}
                      rules={[
                        { required: true, message: 'Please enter variable!' },
                      ]}
                    >
                      <Input placeholder="Variable name" />
                    </Form.Item>
                  </Col>
                  {fields.length > 1 && <Col span={4}>
                    <MinusCircleFilled style={{ fontSize: 20, cursor: "pointer", marginTop: 5 }} onClick={() => remove(field.name)} />
                  </Col>}
                </Row>
              )))}
              <Button onClick={() => add()}><PlusOutlined /> Add another variable</Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default FunctionForm;

