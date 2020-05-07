import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Input, Button, Radio, Row, Col, message, Form } from "antd";
import RadioCard from "../radio-card/RadioCard";
import "./add-secret.css";

let env = 1;

const AddSecret = props => {
  const [form] = Form.useForm();
  let [secretType, setSecretType] = useState();
  if (!secretType) secretType = "env";

  const handleChangedValues = ({ type }) => {
    if (type)
      setSecretType(type);
  }

  const handleSubmit = e => {
    form.validateFields().then(formValues => {
      console.log(formValues);
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
      <Form form={form} onFinish={handleSubmit} onValuesChange={handleChangedValues} initialValues={{ type: "env" }}>
        <p>Secret type</p>
        <Form.Item name="type" rules={[{ required: true, message: "Please select a type!" }]}>
          <Radio.Group>
            <RadioCard value="env">Environment Variables</RadioCard>
            <RadioCard value="file">File Secret</RadioCard>
            <RadioCard value="docker">Docker Secret</RadioCard>
          </Radio.Group>
        </Form.Item>
        {secretType === "env" && (
          <React.Fragment>
            <p>Name your secret</p>
            <Form.Item name="id" rules={[
              { required: true, message: "Please input a secret name" }
            ]}>
              <Input placeholder="Example: DB Secret" />
            </Form.Item>
            <p>Environment variable pairs</p>
            <Form.List name="env" style={{ display: "inline-block" }}>
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field, index) => (
                      <React.Fragment>
                        <Row key={field}>
                          <Col span={10}>
                            {secretType === "env" && (
                              <Form.Item name={[field.key.toString(), "name"]} validateTrigger={["onChange", "onBlur"]}
                                rules={[{ required: true, message: "Please input key" }]}>
                                <Input
                                  style={{ width: "90%", marginRight: "6%", float: "left" }}
                                  placeholder="Key"
                                />
                              </Form.Item>
                            )}
                          </Col>
                          <Col span={10}>
                            {secretType === "env" && (
                              <Form.Item
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[{ required: true, message: "Please input value" }]}
                                name={[field.key.toString(), "value"]}
                              >
                                <Input
                                  placeholder="Value"
                                  style={{ width: "90%", marginRight: "6%", float: "left" }}
                                />
                              </Form.Item>)}
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
                          add();
                        }}
                        style={{ marginRight: "2%", float: "left" }}
                      >
                        <PlusOutlined /> Add another pair
                          </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>
          </React.Fragment>
        )}
        {secretType === "docker" && (
          <React.Fragment>
            <p>Name your secret</p>
            <Form.Item name="id" rules={[
              { required: true, message: "Please input a secret name" }
            ]}>
              <Input placeholder="Example: DB Secret" />
            </Form.Item>
            <p>Docker Username</p>
            <Form.Item name="data.username" rules={[
              {
                required: true,
                message: "Please input your docker username"
              }
            ]}>
              <Input placeholder="Username of your docker registry" />
            </Form.Item>
            <p>Docker Password</p>
            <Form.Item name="data.password" rules={[
              {
                required: true,
                message: "Please input your docker password"
              }
            ]}>
              <Input.Password type="password" placeholder="Password of your docker registry" />
            </Form.Item>
            <p>Docker Registry URL</p>
            <Form.Item name="data.url" rules={[
              {
                required: true,
                message: "Please input your docker registry url"
              }
            ]}>
              <Input placeholder="Example: htttps://foo.bar.com/my-private-registry" />
            </Form.Item>
          </React.Fragment>
        )}
        {secretType === "file" && (
          <React.Fragment>
            <p>Name your secret</p>
            <Form.Item name="id" rules={[
              { required: true, message: "Please input a secret name" }
            ]}>
              <Input placeholder="Example: DB Secret" />
            </Form.Item>
            <p>Root path</p>
            <Form.Item name="rootPath" rules={[
              {
                required: true,
                message: "Please input a root path"
              }
            ]}>
              <Input placeholder="Root path to mount the secret at (eg: /home/.aws)" />
            </Form.Item>
            <p>Files</p>
            <Form.Item>
              <Form.List name="file" style={{ display: "inline-block" }}>
                {(fields, { add, remove }) => {
                  return (
                    <div>
                      {fields.map((field, index) => (
                        <React.Fragment>
                          <Row key={field}>
                            <Col span={8}>
                              {secretType === "file" && (
                                <Form.Item name={[field.key.toString(), "name"]} validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input file name" }]}>
                                  <Input
                                    style={{ width: "98%", marginRight: "6%", float: "left" }}
                                    placeholder="File name (eg: credentials.json)"
                                  />
                                </Form.Item>
                              )}
                            </Col>
                            <Col span={12}>
                              {secretType === "file" && (
                                <Form.Item
                                  validateTrigger={["onChange", "onBlur"]}
                                  rules={[{ required: true, message: "Please input file contents" }]}
                                  name={[field.key.toString(), "value"]}
                                >
                                  <Input.TextArea
                                    rows={4}
                                    placeholder="File contents"
                                    style={{ width: "90%", marginLeft: "6%", float: "left" }}
                                  />
                                </Form.Item>)}
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
                            add();
                          }}
                          style={{ marginRight: "2%", float: "left" }}
                        >
                          <PlusOutlined /> Add another file
                          </Button>
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.List>
            </Form.Item>
          </React.Fragment>
        )}
      </Form>
    </Modal>
  );
};

export default AddSecret;
