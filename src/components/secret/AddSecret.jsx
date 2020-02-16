import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Icon,
  Radio,
  Row,
  Col,
  message
} from "antd";
import RadioCard from "../radio-card/RadioCard";
import "./add-secret.css";

let env = 1;

const AddSecret = props => {
  const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = props.form;
  let secretType = getFieldValue("type");
  if (!secretType) secretType = "env";

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, formValues) => {
      if (!err) {
        const values = {
          name: formValues.name,
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
          props.form.resetFields();
        })
      }
    });
  };

  const initialKeys = [0];
  // ENVIRONMENT VARIABLES
  const envRemove = k => {
    const envKeys = getFieldValue("envKeys");
    if (envKeys.length === 1) {
      return;
    }

    setFieldsValue({
      envKeys: envKeys.filter(key => key !== k)
    });
  };

  const envAdd = () => {
    const nameFields = envKeys.map((k) => `env[${k}].name`)
    const valueFields = envKeys.map((k) => `env[${k}].value`)
    validateFields([...nameFields, ...valueFields], (error) => {
      if (!error) {
        const envKeys = getFieldValue("envKeys");
        const nextKeys = envKeys.concat(env++);
        setFieldsValue({
          envKeys: nextKeys
        });
      }
    })
  };

  getFieldDecorator("envKeys", { initialValue: initialKeys });
  const envKeys = getFieldValue("envKeys");
  const formItemsEnv = envKeys.map((k, index) => (
    <div>
      <Row key={k}>
        <Col span={10}>
          {secretType === "env" && (
            <Form.Item>
              {getFieldDecorator(`env[${k}].name`, {
                rules: [{ required: true, message: "Please input key" }]
              })(
                <Input
                  style={{ width: "90%", marginRight: "6%", float: "left" }}
                  placeholder="Key"
                />
              )}
            </Form.Item>
          )}
        </Col>
        <Col span={10}>
          {secretType === "env" && (
            <Form.Item>
              {getFieldDecorator(`env[${k}].value`, {
                rules: [{ required: true, message: "Please input value" }]
              })(
                <Input
                  placeholder="Value"
                  style={{ width: "90%", marginRight: "6%", float: "left" }}
                />
              )}
            </Form.Item>
          )}
        </Col>
        <Col span={3}>
          {index > 0 ? (
            <Button
              onClick={() => envRemove(k)}
              style={{ marginRight: "2%", float: "left" }}
            >
              <Icon type="delete" />
            </Button>
          ) : null}
        </Col>
      </Row>
      {index === envKeys.length - 1 && (
        <Button
          onClick={() => envAdd(index)}
          style={{ marginRight: "2%", float: "left" }}
        >
          <Icon type="plus" />
          Add another pair
        </Button>
      )}
    </div>
  ));

  const fileRemove = k => {
    const fileKeys = getFieldValue("fileKeys");
    if (fileKeys.length === 1) {
      return;
    }

    setFieldsValue({
      fileKeys: fileKeys.filter(key => key !== k)
    });
  };

  const fileAdd = () => {
    const nameFields = fileKeys.map((k) => `file[${k}].name`)
    const valueFields = fileKeys.map((k) => `file[${k}].value`)
    validateFields([...nameFields, ...valueFields], (error) => {
      if (!error) {
        const fileKeys = getFieldValue("fileKeys");
        const nextKeys = fileKeys.concat(env++);
        setFieldsValue({
          fileKeys: nextKeys
        });
      }
    })
  };

  getFieldDecorator("fileKeys", { initialValue: initialKeys });
  const fileKeys = getFieldValue("fileKeys");
  const formItemsFile = fileKeys.map((k, index) => (
    <div>
      <Row key={k}>
        <Col span={8}>
          {secretType === "file" && (
            <Form.Item>
              {getFieldDecorator(`file[${k}].name`, {
                rules: [{ required: true, message: "Please input file name" }]
              })(
                <Input
                  style={{ width: "98%", marginRight: "6%", float: "left" }}
                  placeholder="File name (eg: credentials.json)"
                />
              )}
            </Form.Item>
          )}
        </Col>
        <Col span={12}>
          {secretType === "file" && (
            <Form.Item>
              {getFieldDecorator(`file[${k}].value`, {
                rules: [{ required: true, message: "Please input file contents" }]
              })(
                <Input.TextArea
                  rows={4}
                  placeholder="File contents"
                  style={{ width: "90%", marginLeft: "6%", float: "left" }}
                />
              )}
            </Form.Item>
          )}
        </Col>
        <Col span={3}>
          {index > 0 ? (
            <Button
              onClick={() => fileRemove(k)}
              style={{ marginRight: "2%", float: "left" }}
            >
              <Icon type="delete" />
            </Button>
          ) : null}
        </Col>
      </Row>
      {index === fileKeys.length - 1 && (
        <Button
          onClick={() => fileAdd(index)}
          style={{ marginRight: "2%", float: "left" }}
        >
          <Icon type="plus" />
          Add another file
        </Button>
      )}
    </div>
  ));

  return (
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Secret`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="800px"
    >
      <Form>
        <p>Secret type</p>
        <Form.Item>
          {getFieldDecorator("type", {
            rules: [{ required: true, message: "Please select a type!" }],
            initialValue: "env"
          })(
            <Radio.Group>
              <RadioCard value="env">Environment Variables</RadioCard>
              <RadioCard value="file">File Secret</RadioCard>
              <RadioCard value="docker">Docker Secret</RadioCard>
            </Radio.Group>
          )}
        </Form.Item>
        {secretType === "env" && (
          <React.Fragment>
            <p>Name your secret</p>
            <Form.Item>
              {getFieldDecorator("name", {
                rules: [
                  { required: true, message: "Please input a secret name" }
                ]
              })(<Input placeholder="Example: DB Secret" />)}
            </Form.Item>
            <p>Environment variable pairs</p>
            <Form.Item>{formItemsEnv}</Form.Item>
          </React.Fragment>
        )}
        {secretType === "docker" && (
          <React.Fragment>
            <p>Name your secret</p>
            <Form.Item>
              {getFieldDecorator("name", {
                rules: [
                  { required: true, message: "Please input a secret name" }
                ]
              })(<Input placeholder="Example: DB Secret" />)}
            </Form.Item>
            <p>Docker Username</p>
            <Form.Item>
              {getFieldDecorator("data.username", {
                rules: [
                  {
                    required: true,
                    message: "Please input your docker username"
                  }
                ]
              })(<Input placeholder="Username of your docker registry" />)}
            </Form.Item>
            <p>Docker Password</p>
            <Form.Item>
              {getFieldDecorator("data.password", {
                rules: [
                  {
                    required: true,
                    message: "Please input your docker password"
                  }
                ]
              })(<Input.Password type="password" placeholder="Password of your docker registry" />)}
            </Form.Item>
            <p>Docker Registry URL</p>
            <Form.Item>
              {getFieldDecorator("data.url", {
                rules: [
                  {
                    required: true,
                    message: "Please input your docker registry url"
                  }
                ]
              })(
                <Input placeholder="Example: https://index.docker.io/v1/" />
              )}
            </Form.Item>
          </React.Fragment>
        )}
        {secretType === "file" && (
          <React.Fragment>
            <p>Name your secret</p>
            <Form.Item>
              {getFieldDecorator("name", {
                rules: [
                  { required: true, message: "Please input a secret name" }
                ]
              })(<Input placeholder="Example: DB Secret" />)}
            </Form.Item>
            <p>Root path</p>
            <Form.Item>
              {getFieldDecorator("rootPath", {
                rules: [
                  {
                    required: true,
                    message: "Please input a root path"
                  }
                ]
              })(
                <Input placeholder="Root path to mount the secret at (eg: /home/.aws)" />
              )}
            </Form.Item>
            <p>Files</p>
            <Form.Item>{formItemsFile}</Form.Item>
          </React.Fragment>
        )}
      </Form>
    </Modal>
  );
};

const WrappedRuleForm = Form.create({})(AddSecret);

export default WrappedRuleForm;
