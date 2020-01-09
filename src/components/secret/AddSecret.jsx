import React from 'react';
import { Modal, Form, Input, Upload, Button, Icon, Radio, Row, Col, message } from 'antd';
import RadioCard from "../radio-card/RadioCard";
import { getSecretType } from '../../utils'
import './add-secret.css';

let id = 0;
let env = 1;

const AddSecret = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;
  let defaultSecretType = getSecretType(getFieldValue("type"), "Environment Variables")

  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        let options = values.options
        if (options && !options.col) {
          delete options["col"]
        }

        //props.handleSubmit(getFieldValue("secretName"), getFieldValue("dockerEmail"), getFieldValue("dockerPass"), getFieldValue("fileSecret"), getFieldValue("names"));
        props.handleCancel();
        props.form.resetFields();
      }
    });
  }

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

  const envAdd = (id) => {
    if(getFieldValue(`env[${id}].name`) && getFieldValue(`env[${id}].value`)){
      const envKeys = getFieldValue("envKeys");
      const nextKeys = envKeys.concat(env++);
      setFieldsValue({
        envKeys: nextKeys
      });
    }
    else{
      message.info("Please first input key value pair then add new field");
    }
  };

  getFieldDecorator("envKeys", { initialValue: initialKeys });
  const envKeys = getFieldValue("envKeys");
  const formItemsEnv = envKeys.map((k, index) => (
    <Row key={k}>
      <Col span={10}>
        <Form.Item>
          {getFieldDecorator(`env[${k}].name`,
           { })(<Input style={{width: "90%", marginRight: "6%", float: "left"}} placeholder="Key"/>)}
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item>
          {getFieldDecorator(`env[${k}].value`,
           { })(<Input placeholder="Value"  style={{width: "90%",  marginRight: "6%", float: "left"}} />)}
        </Form.Item>
      </Col>
      <Col span={3}>
        {index === envKeys.length - 1 && (
          <Button onClick={() => envAdd(index)} style={{ marginRight: "2%", float: "left"}}>
            <Icon type="plus" />Add
          </Button>
        )}
        {index !== envKeys.length - 1 && (
          <Button onClick={() => envRemove(k)} style={{ marginRight: "2%", float: "left"}}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
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

  const fileAdd = (id) => {
    if(getFieldValue(`file[${id}].name`) && getFieldValue(`file[${id}].value`)){
      const fileKeys = getFieldValue("fileKeys");
      const nextKeys = fileKeys.concat(env++);
      setFieldsValue({
        fileKeys: nextKeys
      });
    }
    else{
      message.info("Please first input location and choose a file then add new field");
    }
  };

  getFieldDecorator("fileKeys", { initialValue: initialKeys });
  const fileKeys = getFieldValue("fileKeys");
  const formItemsFile = fileKeys.map((k, index) => (
    <Row key={k}>
      <Col span={14}>
        <Form.Item>
          {getFieldDecorator(`file[${k}].name`, 
           { })(<Input style={{width: "98%", marginRight: "6%", float: "left"}} placeholder="Key"/>)}
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item>
          {getFieldDecorator(`file[${k}].value`,
           { })(<Upload {...props} accept=".txt">
             <Button type="primary" style={{width: "100%",  marginRight: "6%", float: "left"}}>Choose File</Button>
           </Upload>)}
        </Form.Item>
      </Col>
      <Col span={3}>
        {index === fileKeys.length - 1 && (
          <Button onClick={() => fileAdd(index)} style={{ marginRight: "2%", float: "left"}}>
            <Icon type="plus" />Add
          </Button>
        )}
        {index !== fileKeys.length - 1 && (
          <Button onClick={() => fileRemove(k)} style={{ marginRight: "2%", float: "left"}}>
            <Icon type="delete" />
          </Button>
        )}
      </Col>
    </Row>
  ));

  return(
    <Modal
      title={`${props.initialValues ? "Edit" : "Add"} Secret`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="600px"
    >
      <Form>
          <p>Secret type</p>
          <Form.Item>
          {getFieldDecorator('type', {
            rules: [{ required: true, message: 'Please select a type!' }],
            initialValue: "env var"
          })(
            <Radio.Group>
              <RadioCard value="env var">Environment Variables</RadioCard>
              <RadioCard value="docker secret">Docker Secret</RadioCard>
              <RadioCard value="file secret">File Secret</RadioCard>
            </Radio.Group>
          )}
          </Form.Item>
          {(!defaultSecretType || defaultSecretType === "Environment Variables") && <React.Fragment> 
          <p>Name your secret</p>
          <Form.Item>
            {getFieldDecorator('secretName', {
              rules: [{ required: true, message: 'Please input a secret name' }],
            })(
              <Input placeholder="Example: DB Secret" />,
            )}
          </Form.Item>
          <p>Environment Variables</p>
          <Form.Item >
            {formItemsEnv}
          </Form.Item>
          </React.Fragment>}
          {(defaultSecretType === "Docker Secret" && <React.Fragment>
          <p>Name your secret</p>
          <Form.Item>
            {getFieldDecorator('secretName', {
              rules: [{ required: true, message: 'Please input a secret name' }],
            })(
              <Input placeholder="Example: DB Secret" />,
            )}
          </Form.Item>
          <p>Docker email</p>
          <Form.Item>
            {getFieldDecorator('dockerEmail', {
              rules: [{ required: true, message: 'Please input docker email' }],
            })(
              <Input placeholder="Email address" />,
            )}
          </Form.Item>
          <p>Docker Password</p>
          <Form.Item>
            {getFieldDecorator('dockerPass', {
              rules: [{ required: true, message: 'Please input docker password' }],
            })(
              <Input placeholder="password" />,
            )}
          </Form.Item>
          </React.Fragment>)}
          {(defaultSecretType === "File Secret" && <React.Fragment>
          <p>Name your secret</p>
          <Form.Item>
            {getFieldDecorator('secretName', {
              rules: [{ required: true, message: 'Please input a secret name' }],
            })(
              <Input placeholder="Example: DB Secret" />,
            )}
          </Form.Item>
          <p>File secret</p>
          <Form.Item>
            {formItemsFile}
          </Form.Item>
          </React.Fragment>)}
      </Form>
    </Modal>
  );
}

const WrappedRuleForm = Form.create({})(AddSecret);

export default WrappedRuleForm