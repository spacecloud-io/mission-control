import React from 'react'
import { Form, Switch, Button } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

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
  const switchToggle = () => {
    if(initialValues.enabled){
      return <Switch defaultChecked />;
    }else{
      return <Switch />
    }
  } 
  
  return (
    <Form>
      <Form.Item>
        <FormItemLabel name={"Enabled"} />
        {getFieldDecorator('enabled', { initialValue: initialValues.enabled })(
          switchToggle()
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
