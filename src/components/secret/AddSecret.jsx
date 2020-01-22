import React from 'react';
import { Modal, Form, Input, Upload, Button, Icon, Radio, Row, Col, message } from 'antd';
import RadioCard from "../radio-card/RadioCard";
import { getSecretType } from '../../utils'
import './add-secret.css';

let env = 1;

const AddSecret = (props) => {
  const { getFieldDecorator, getFieldValue, setFieldsValue } = props.form;
  const { key, location } = props.initialValues ? props.initialValues : {}
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
    <div>
    <Row key={k}>
      <Col span={10}>
        {defaultSecretType === "Environment Variables" && <Form.Item>
          {getFieldDecorator(`env[${k}].name`,
           { rules: [{ required: true, message: 'Please input key' }] 
           })(<Input style={{width: "90%", marginRight: "6%", float: "left"}} placeholder="Key"/>)}
        </Form.Item>}
      </Col>
      <Col span={10}>
        {defaultSecretType === "Environment Variables" && <Form.Item>
          {getFieldDecorator(`env[${k}].value`,
           { rules: [{ required: true, message: 'Please input value' }]
            })(<Input placeholder="Value"  style={{width: "90%",  marginRight: "6%", float: "left"}} />)}
        </Form.Item>}
      </Col>
      <Col span={3}>
        {envKeys.length > 1 ? (
          <Button onClick={() => envRemove(k)} style={{ marginRight: "2%", float: "left"}}>
            <Icon type="delete" />
          </Button>
        ): null}
      </Col>
    </Row>
    {index === envKeys.length - 1 && (
      <Button onClick={() => envAdd(index)} style={{ marginRight: "2%", float: "left"}}>
        <Icon type="plus" />Add another pair
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
    <div>
    <Row key={k}>
      <Col span={14}>
        {defaultSecretType === "File Secret" && <Form.Item>
          {getFieldDecorator(`file[${k}].loc_name`, 
           { rules: [{ required: true, message: 'Please input file name' }] 
          })(<Input style={{width: "98%", marginRight: "6%", float: "left"}} placeholder="File name (eg: credentials.json)"/>)}
        </Form.Item>}
      </Col>
      <Col span={6}>
        {defaultSecretType === "File Secret" && <Form.Item>
          {getFieldDecorator(`file[${k}].value`,
           { rules: [{ required: true, message: 'Please upload a file' }] 
           })(<Upload {...props} >
             <Button type="default" style={{width: "100%",  marginRight: "6%", float: "left"}}><Icon type="upload" />Choose File</Button>
           </Upload>)}
        </Form.Item>}
      </Col>
      <Col span={3}>
        {fileKeys.length > 1 ? (
          <Button onClick={() => fileRemove(k)} style={{ marginRight: "2%", float: "left"}}>
            <Icon type="delete" />
          </Button>
        ): null}
      </Col>
    </Row>
    {index === fileKeys.length - 1 && (
      <Button onClick={() => fileAdd(index)} style={{ marginRight: "2%", float: "left"}}>
        <Icon type="plus" />Add another file
      </Button>
    )}
    </div>
  ));

  return(
    <div>
    {!props.eachAdd && 
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
              <RadioCard value="file secret">File Secret</RadioCard>
              <RadioCard value="docker secret">Docker Secret</RadioCard>
            </Radio.Group>
          )}
          </Form.Item>
          {(!defaultSecretType || defaultSecretType === "Environment Variables") && <React.Fragment> 
          <p>Name your secret</p>
          <Form.Item>
            {getFieldDecorator('envVarSecretName', {
              rules: [{ 
              validator: (_, value, cb) => {
                if (!value) {
                  cb("Please provide a service name!")
                  return
                }
                if (value.includes(" ")) {
                  cb("Secret name cannot contain spaces!")
                }
                cb()
              } }],
            })(
              <Input placeholder="Example: DB Secret" />,
            )}
          </Form.Item>
          <p>Environment variable pairs</p>
          <Form.Item >
            {formItemsEnv}
          </Form.Item>
          </React.Fragment>}
          {(defaultSecretType === "Docker Secret" && <React.Fragment>
          <p>Name your secret</p>
          <Form.Item>
            {getFieldDecorator('dockerSecretName', {
              rules: [{ required: true, message: 'Please input a secret name' }],
            })(
              <Input placeholder="Example: DB Secret" />,
            )}
          </Form.Item>
          <p>Docker Username</p>
          <Form.Item>
            {getFieldDecorator('dockerUsername', {
              rules: [{ required: true, message: 'Please input your docker username' }],
            })(
              <Input placeholder="Username of your docker registry" />,
            )}
          </Form.Item>
          <p>Docker Password</p>
          <Form.Item>
            {getFieldDecorator('dockerPass', {
              rules: [{ required: true, message: 'Please input your docker password' }],
            })(
              <Input placeholder="Password of your docker registry" />,
            )}
          </Form.Item>
          <p>Docker Registry URL</p>
          <Form.Item>
            {getFieldDecorator('dockerRegUrl', {
              rules: [{ required: true, message: 'Please input your docker registry url' }],
            })(
              <Input placeholder="Example: htttps://foo.bar.com/my-private-registry" />,
            )}
          </Form.Item>
          </React.Fragment>)}
          {(defaultSecretType === "File Secret" && <React.Fragment>
          <p>Name your secret</p>
          <Form.Item>
            {getFieldDecorator('FileSecretName', {
              rules: [{ required: true, message: 'Please input a secret name' }],
              })(
              <Input placeholder="Example: DB Secret" />,
            )}
          </Form.Item>
          <p>Mount location</p>
          <Form.Item>
            {getFieldDecorator('location', {
              rules: [{ required: true, message: 'Please input a file location' }],
              })(
              <Input placeholder="File path to mount the secret at (eg: /home/.aws)" />,
            )}
          </Form.Item>
          <p>Files</p>
          <Form.Item>
            {formItemsFile}
          </Form.Item>
          </React.Fragment>)}
      </Form>
    </Modal>}
    {props.eachAdd && 
      <Modal
      title={`${props.initialValues ? "Update" : "Add"} ${props.type}`}
      okText={props.initialValues ? "Save" : "Add"}
      visible={true}
      onCancel={props.handleCancel}
      onOk={handleSubmit}
      width="600px"
    >
        {props.type === "Environment Variables" && <Form>
            {!props.update && <div><p>Key</p>
            <Form.Item>
            {getFieldDecorator(`key`, { rules: [{ required: true, message: 'Please input key' }],
           })(<Input style={{width: "90%", marginRight: "6%", float: "left"}} placeholder="Key"/>)}
           </Form.Item></div>}
           {props.update && <div><p>Key</p>
            <Form.Item>
            {getFieldDecorator(`key`, { rules: [{ required: true, message: 'Please input key' }], initialValues: key 
           })(<Input disabled={true} style={{width: "90%", marginRight: "6%", float: "left"}} placeholder="Key"/>)}
           </Form.Item></div>}
           <p>Value</p>
           <Form.Item>
           {getFieldDecorator(`value`,
           { rules: [{ required: true, message: 'Please input value' }], 
            })(<Input placeholder="Value"  style={{width: "90%",  marginRight: "6%", float: "left"}} />)}
          </Form.Item>
          </Form>}
          {props.type === "File Secret" && <Form>
            {!props.update && <div> <p>Location</p>
            <Form.Item>
            {getFieldDecorator(`location`, 
            { rules: [{ required: true, message: 'Please input file mount location' }], 
            })(<Input style={{width: "98%", marginRight: "6%", float: "left"}} placeholder="File mount location"/>)}
           </Form.Item></div>}
           {props.update && <div><p>Location</p>
            <Form.Item>
            {getFieldDecorator(`location`, 
            { rules: [{ required: true, message: 'Please input file mount location' }], initialValues: location
            })(<Input disabled={true} style={{width: "98%", marginRight: "6%", float: "left"}} placeholder="File mount location"/>)}
           </Form.Item></div>}
           <Form.Item>
           {getFieldDecorator(`fileUpload`,
           { rules: [{ required: true, message: 'Please upload a file' }] 
           })(<Upload {...props}>
             <Button type="primary" style={{width: "100%",  marginRight: "6%", float: "left"}}>Choose File</Button>
           </Upload>)}
          </Form.Item>
          </Form>} 
    </Modal>}
    </div>
  );
}

const WrappedRuleForm = Form.create({})(AddSecret);

export default WrappedRuleForm