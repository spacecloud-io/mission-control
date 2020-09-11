import React from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Input, Button, Radio, Row, Col, Form } from "antd";
import RadioCards from "../radio-cards/RadioCards";
import ConditionalFormBlock from "../conditional-form-block/ConditionalFormBlock";
import FormItemLabel from "../form-item-label/FormItemLabel";

const AddSecret = props => {
  const [form] = Form.useForm();

  const handleSubmit = e => {
    form.validateFields().then(formValues => {
      const values = {
        id: formValues.id,
        type: formValues.type
      };
      switch (values.type) {
        case "env":
          values.data = formValues.env.reduce((prev, curr) => {
            return Object.assign({}, prev, { [curr.name]: curr.value });
          }, {});
          break;
        case "docker":
          values.data = formValues.data;
          break;
        case "file":
          values.rootPath = formValues.rootPath
          values.data = formValues.file.reduce((prev, curr) => {
            return Object.assign({}, prev, { [curr.name]: curr.value });
          }, {});
          break;
      }

      props.handleSubmit(values).then(() => {
        props.handleCancel();
        form.resetFields();
      })
    });
  };

  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Secret`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="800px"
    >
      <Form form={form} onFinish={handleSubmit} initialValues={{ type: "env", env: [{name: "", value: ""}], file: [{name: "", value: ""}] }}>
        <FormItemLabel name="Secret type" />
        <Form.Item name="type" rules={[{ required: true, message: "Please select a type!" }]}>
          <RadioCards>
            <Radio.Button value="env">Environment Variables</Radio.Button>
            <Radio.Button value="file">File Secret</Radio.Button>
            <Radio.Button value="docker">Docker Secret</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency="type" condition={() => form.getFieldValue("type") === "env"}>
          <FormItemLabel name="Name your secret" />
          <Form.Item name="id" rules={[
            { required: true, message: "Please input a secret name" }
          ]}>
            <Input placeholder="Example: DB Secret" />
          </Form.Item>
          <FormItemLabel name="Environment variable pairs" />
          <Form.List name="env" style={{ display: "inline-block" }}>
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map((field, index) => (
                    <React.Fragment>
                      <Row key={field}>
                        <Col span={10}>
                          <Form.Item name={[field.name, "name"]} validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input key" }]}>
                            <Input
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                              placeholder="Key"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input value" }]}
                            name={[field.name, "value"]}
                          >
                            <Input
                              placeholder="Value"
                              style={{ width: "90%", marginRight: "6%", float: "left" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          {fields.length > 1 ? (
                            <Button
                              onClick={() => remove(field.name)}
                              style={{ marginRight: "2%", float: "left" }}
                            >
                              <DeleteOutlined />
                            </Button>
                          ) : null}
                        </Col>
                      </Row>
                    </React.Fragment>
                  ))}
                  <Form.Item>
                    <Button
                      onClick={() => {
                        const fieldKeys = [
                          ...fields.map(obj => ["env", obj.name,"name"]),
                          ...fields.map(obj => ["env", obj.name,"value"])
                        ]
                        form.validateFields(fieldKeys)
                          .then(() => add())
                          .catch(ex => console.log("Exception", ex))
                      }}
                      style={{ marginRight: "2%", float: "left" }}
                    >
                      <PlusOutlined /> Add
                          </Button>
                  </Form.Item>
                </div>
              );
            }}
          </Form.List>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="type" condition={() => form.getFieldValue("type") === "docker"}>
          <FormItemLabel name="Name your secret" />
          <Form.Item name="id" rules={[
            { required: true, message: "Please input a secret name" }
          ]}>
            <Input placeholder="Example: DB Secret" />
          </Form.Item>
          <FormItemLabel name="Docker Username" />
          <Form.Item name={["data", "username"]} rules={[
            {
              required: true,
              message: "Please input your docker username"
            }
          ]}>
            <Input placeholder="Username of your docker registry" />
          </Form.Item>
          <FormItemLabel name="Docker Password" />
          <Form.Item name={["data", "password"]} rules={[
            {
              required: true,
              message: "Please input your docker password"
            }
          ]}>
            <Input.Password type="password" placeholder="Password of your docker registry" />
          </Form.Item>
          <FormItemLabel name="Docker Registry URL" />
          <Form.Item name={["data", "url"]} rules={[
            {
              required: true,
              message: "Please input your docker registry url"
            }
          ]}>
            <Input placeholder="Example: https://index.docker.io/v1/" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="type" condition={() => form.getFieldValue("type") === "file"}>
          <FormItemLabel name="Name your secret" />
          <Form.Item name="id" rules={[
            { required: true, message: "Please input a secret name" }
          ]}>
            <Input placeholder="Example: DB Secret" />
          </Form.Item>
          <FormItemLabel name="Root path" />
          <Form.Item name="rootPath" rules={[
            {
              required: true,
              message: "Please input a root path"
            }
          ]}>
            <Input placeholder="Root path to mount the secret at (eg: /home/.aws)" />
          </Form.Item>
          <FormItemLabel name="Files" />
          <Form.Item>
            <Form.List name="file" style={{ display: "inline-block" }}>
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field) => (
                      <Row key={field}>
                        <Col span={8}>
                          <Form.Item name={[field.name, "name"]} validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input file name" }]}>
                            <Input
                              style={{ width: "98%", marginRight: "6%", float: "left" }}
                              placeholder="File name (eg: credentials.json)"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[{ required: true, message: "Please input file contents" }]}
                            name={[field.name, "value"]}
                          >
                            <Input.TextArea
                              rows={4}
                              placeholder="File contents"
                              style={{ width: "90%", marginLeft: "6%", float: "left" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          {fields.length > 1 ? (
                            <Button
                              onClick={() => remove(field.name)}
                              style={{ marginRight: "2%", float: "left" }}
                            >
                              <DeleteOutlined />
                            </Button>
                          ) : null}
                        </Col>
                      </Row>
                    ))}
                    <Form.Item>
                      <Button
                        onClick={() => {
                          const fieldKeys = [
                            ...fields.map(obj => ["file", obj.name,"name"]),
                            ...fields.map(obj => ["file", obj.name,"value"])
                          ]
                          form.validateFields(fieldKeys)
                            .then(() => add())
                            .catch(ex => console.log("Exception", ex))
                        }}
                        style={{ marginRight: "2%", float: "left" }}
                      >
                        <PlusOutlined /> Add
                          </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  );
};

export default AddSecret;
