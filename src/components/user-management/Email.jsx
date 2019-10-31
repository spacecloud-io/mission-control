import React from 'react'
import { Form, Switch, Button } from 'antd';

const Email = ({ form, initialValues, handleSubmit }) => {
  const { getFieldDecorator } = form;

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit({ enabled: values.enabled });
      }
    });
  }
  return (
    <Form>
      <Form.Item>
        {getFieldDecorator('enabled', { initialValue: initialValues.enabled, valuePropName: "checked" })(
          <span className='realtime'>
            Enabled: <Switch />
          </span>
        )}
      </Form.Item>
      <br />
      <Form.Item>
        <Button onClick={handleSubmitClick}>Save</Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create({})(Email);
