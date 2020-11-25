import React from 'react';
import { Modal, Form, Input } from 'antd';
import FormItemLabel from '../../../form-item-label/FormItemLabel';
import { dbTypes } from '../../../../constants';

const EditDriverConfigForm = ({ handleSubmit, handleCancel, dbType, initialValues }) => {

  const formInitialValues = initialValues ? Object.assign({}, initialValues, { maxIdleTimeout: initialValues.maxIdleTimeout / 1000 }) : {}

  const [form] = Form.useForm()

  const handleSubmitClick = () => {
    form.validateFields().then(values => {
      let driverConf = {}
      if (dbType === dbTypes.MONGO) {
        driverConf = {
          maxConn: Number(values.maxConn),
          minConn: Number(values.minConn),
          maxIdleTimeout: Number(values.maxIdleTimeout * 1000)
        }
      } else {
        driverConf = {
          maxConn: Number(values.maxConn),
          maxIdleConn: Number(values.maxIdleConn),
          maxIdleTimeout: Number(values.maxIdleTimeout * 1000)
        }
      }
      handleSubmit(driverConf)
      handleCancel()
    })
  }

  return (
    <Modal
      title='Configure database driver'
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
      okText='Save'>
      <Form form={form} initialValues={formInitialValues} onFinish={handleSubmitClick}>
        <FormItemLabel name='Max connections' description="Default: 100" />
        <Form.Item name='maxConn' rules={[{ required: true, message: 'Please input max connections' }]}>
          <Input placeholder='Max database connections' />
        </Form.Item>
        {dbType === dbTypes.MONGO && <React.Fragment>
          <FormItemLabel name='Min connections' description="Default: 10" />
          <Form.Item name='minConn' rules={[{ required: true, message: 'Please input min connections' }]}>
            <Input placeholder='Min database connections' />
          </Form.Item>
        </React.Fragment>}
        {dbType !== dbTypes.MONGO && <React.Fragment>
          <FormItemLabel name='Max idle connections' description="Default: 50" />
          <Form.Item name='maxIdleConn' rules={[{ required: true, message: 'Please input max idle connections' }]}>
            <Input placeholder='Max idle database connections' />
          </Form.Item>
        </React.Fragment>}
        <FormItemLabel name='Max idle timeout' description="Default: 300 seconds" hint='(in seconds)' />
        <Form.Item name='maxIdleTimeout' rules={[{ required: true, message: 'Please input max idle timeout' }]}>
          <Input placeholder='Max idle timeout in milliseconds' />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditDriverConfigForm;