import React from 'react';
import { Modal, Form, Input } from 'antd';
import FormItemLabel from '../../../form-item-label/FormItemLabel';
import { dbTypes } from '../../../../constants';

const EditBatchingConfigForm = ({ handleSubmit, handleCancel, initialValues }) => {

  const formInitialValues = {
    batchTime: initialValues && initialValues.batchTime ? initialValues.batchTime : 200,
    batchRecords: initialValues && initialValues.batchRecords ? initialValues.batchRecords : 200
  }

  const [form] = Form.useForm()

  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      handleSubmit(Number(values.batchTime), Number(values.batchRecords))
      handleCancel()
    })
  }

  return (
    <Modal
      title='Configure batching config'
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
      okText='Save'>
      <Form form={form} initialValues={formInitialValues} onFinish={handleSubmitClick}>
        <FormItemLabel name='Batch time' hint="(Default: 200 milliseconds)" />
        <Form.Item name='batchTime' rules={[{ required: true, message: 'Please input batch time' }]}>
          <Input placeholder='Batch time in milliseconds' />
        </Form.Item>
        <FormItemLabel name='Batch records' hint='(Default: 200)' />
        <Form.Item name='batchRecords' rules={[{ required: true, message: 'Please input number of batch record' }]}>
          <Input placeholder='Batch records' />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditBatchingConfigForm;