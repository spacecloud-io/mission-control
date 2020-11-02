import React from 'react';
import { Modal, Form, Input } from 'antd';
import FormItemLabel from '../../../form-item-label/FormItemLabel';
import { dbTypes } from '../../../../constants';

const EditDriverConfigForm = ({ handleSubmit, handleCancel, dbType, initialValue }) => {

  const [form] = Form.useForm()

  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      handleSubmit(values)
      handleCancel()
    })
  }

  return(
    <Modal
    title='Configure database driver'
    visible={true}
    onOk={handleSubmitClick}
    onCancel={handleCancel}
    okText='Save'>
      <Form form={form} initialValues={initialValue} onFinish={handleSubmitClick}>
        <FormItemLabel name='Max connections (default: 100)' />
        <Form.Item name='maxConn' rules={[{ required: true, message: 'Please input max connections' }]}>
          <Input placeholder='Max database connections' />
        </Form.Item>
        {dbType === dbTypes.MONGO && <React.Fragment>
          <FormItemLabel name='min connections (default: 10)' />
          <Form.Item name='minConn' rules={[{ required: true, message: 'Please input min connections' }]}>
            <Input placeholder='Min database connections' />
          </Form.Item>
        </React.Fragment>}
        {dbType !== dbTypes.MONGO && <React.Fragment>
          <FormItemLabel name='Max idle connections (default: 50)' />
          <Form.Item name='maxIdleConn' rules={[{ required: true, message: 'Please input max idle connections' }]}>
            <Input placeholder='Max idle database connections' />
          </Form.Item>
        </React.Fragment>}
        <FormItemLabel name='Max idle timeout (default: 300ms)' />
        <Form.Item name='maxIdleTimeout' rules={[{ required: true, message: 'Please input max idle timeout' }]}>
          <Input placeholder='Max idle timeout in milliseconds' />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditDriverConfigForm;