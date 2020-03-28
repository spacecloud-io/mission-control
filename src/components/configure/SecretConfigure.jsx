import React from 'react'
import { Form, Input, Button } from 'antd';
import { generateJWTSecret } from '../../utils';

const SecretConfigure = ({ form, secret, handleSubmit }) => {
  const { getFieldDecorator, setFieldsValue, getFieldValue } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values.secret);
      }
    });
  }

  const handleClickGenerateSecret = () => {
    const newSecret = generateJWTSecret()
    setFieldsValue({ secret: newSecret })
  }

  const currentSecret = getFieldValue("secret")
  const isSecretChanged = currentSecret !== undefined && secret !== currentSecret

  return (
    <div>
      <p>This secret is used by the authorization module in Space Cloud to verify the JWT token for all API requests</p>
      <Form>
        <div style={{ display: "flex" }}>
          <Form.Item style={{ flex: 1 }}>
            {getFieldDecorator('secret', {
              rules: [{ required: true, message: 'Please input a secret!' }],
              initialValue: secret
            })(
              <Input.Password placeholder="Enter JWT Secret" />
            )}
          </Form.Item>
          <Form.Item>
            <Button onClick={handleClickGenerateSecret} >
              Generate new JWT Secret
          </Button>
          </Form.Item>
        </div>
        <Form.Item>
          <Button disabled={!isSecretChanged} onClick={handleSubmitClick} >
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Form.create({})(SecretConfigure);