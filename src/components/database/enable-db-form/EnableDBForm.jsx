import React from "react"
import { Modal, Input, Form, Checkbox, AutoComplete, Alert } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import { defaultDbConnectionStrings } from "../../../constants";

const EnableDBForm = ({ handleSubmit, handleCancel, initialValues, envSecret }) => {
  const [form] = Form.useForm();

  const formInitialValues = {
    loadFromSecret: initialValues.conn.includes('secrets.') ? true : false,
    conn: initialValues.conn.includes('secrets.') ? defaultDbConnectionStrings[initialValues.db] : initialValues.conn,
    secret: initialValues.conn.includes('secrets.') ? initialValues.conn.split('.')[1] : ''
  }

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
      let connectionString;
      if(values.secret){
        connectionString = `secrets.${values.secret}`;
      }else{
        connectionString = values.conn
      }
      handleSubmit(connectionString).then(() => handleCancel())
    });
  };

  const alertMsg = <div>
    <b>Note:</b> If your database is running inside a docker container, use the container IP address of that docker container as the host in the connection string.
  </div>

  return (
    <Modal
      title="Enable database"
      okText="Save"
      visible={true}
      onCancel={handleCancel}
      onOk={handleSubmitClick}
    >
      <Form layout="vertical" form={form} initialValues={formInitialValues} onFinish={handleSubmitClick}>
        <FormItemLabel name="Connection string" />
        <Form.Item name='loadFromSecret'  valuePropName='checked'>
          <Checkbox>Load connection string from a secret</Checkbox>
        </Form.Item>
        <ConditionalFormBlock 
          dependency='loadFromSecret'
          condition={() => form.getFieldValue('loadFromSecret') === false}
        >
          <Form.Item name="conn" rules={[{ required: true, message: 'Please input a connection string' }]}>
            <Input.Password placeholder="eg: mongodb://localhost:27017" />
          </Form.Item>
          <Alert message={alertMsg}
          description=" "
          type="info"
          showIcon />
        </ConditionalFormBlock>
        <ConditionalFormBlock
          dependency='loadFromSecret'
          condition={() => form.getFieldValue('loadFromSecret') === true}
        >
          <Form.Item name="secret" rules={[{ required: true, message: 'Please input a connection string' }]}>
            <AutoComplete placeholder="secret">
              {envSecret.map(secret => Object.keys(secret).map(key => {
                return <AutoComplete.Option key={key}>{key}</AutoComplete.Option>
              }))}
            </AutoComplete>
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  );
}

export default EnableDBForm;