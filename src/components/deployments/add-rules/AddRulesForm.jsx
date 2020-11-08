import React from 'react';
import { Modal, Form, Select } from 'antd';
import FormItemLabel from '../../form-item-label/FormItemLabel';

const AddRuleForm = ({ initialValues, handleSubmit, handleCancel }) => {

  const [form] = Form.useForm();

  const formInitialValues = {
    apiGroups: initialValues && initialValues.apiGroups ? initialValues.apiGroups : [],
    verbs: initialValues && initialValues.verbs ? initialValues.verbs : [],
    resources: initialValues && initialValues.resources ? initialValues.resources : [],
  }

  const handleSubmitClick = () => {
    const operation = initialValues ? 'edit' : 'add'
    form.validateFields().then(values => {
      handleSubmit(values, operation);
      handleCancel();
    })
  }

  return(
    <Modal
      title={initialValues ? 'Update rule' : 'Add Rule'}
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
      okText={initialValues ? 'Save' : 'Add'}>
        <Form form={form} initialValues={formInitialValues} onFinish={handleSubmitClick}>
          <FormItemLabel name='API groups' />
          <Form.Item name='apiGroups'>
            <Select
             mode='tags'
             placeholder='API groups'
             tokenSeparators={[',']}>
            </Select>
          </Form.Item>
          <FormItemLabel name='Verbs' />
          <Form.Item name='verbs' rules={[{ required: true, message: 'Please input verbs'}]}>
            <Select
             mode='tags'
             placeholder='Verbs'
             tokenSeparators={[',']}>
            </Select>
          </Form.Item>
          <FormItemLabel name='Resources' />
          <Form.Item name='resources' rules={[{ required: true, message: 'Please input resources' }]}>
            <Select
             mode='tags'
             placeholder='resources'
             tokenSeparators={[',']}>
            </Select>
          </Form.Item>
        </Form>
    </Modal>
  );
}

export default AddRuleForm;