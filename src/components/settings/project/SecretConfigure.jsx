import React, { useState } from 'react'
import { EyeInvisibleOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip, Button, Radio, Alert, Popconfirm, Table, Modal, Input, Checkbox } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { generateJWTSecret } from '../../../utils';

const AddSecretModal = ({ handleSubmit, handleCancel }) => {
  const [form] = Form.useForm();
  const handleSubmitClick = (e) => {
    form.validateFields().then(values => {
      const { secret, isPrimary } = values;
      handleSubmit(secret, isPrimary).then(() => handleCancel())
    });
  };

  return (
    <Modal
      title="Add secret"
      okText="Add"
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical" initialValues={{ secret: generateJWTSecret(), isPrimary: true }}>
        <FormItemLabel name="Secret" />
        <Form.Item name="secret"
          rules={[{ required: true, message: 'Please provide a secret' }]}
        >
          <Input.Password className="input" placeholder="Secret value" />
        </Form.Item>
        <FormItemLabel name="Primary secret" />
        <Form.Item name="isPrimary" valuePropName="checked">
          <Checkbox >Use this secret in user management module of API gateway to sign tokens on successful signup/signin requests</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const SecretValue = ({ secret }) => {
  const [showSecret, setShowSecret] = useState(false)
  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      <span style={{
        marginRight: 8,
        background: "#f5f5f5",
        minWidth: 320,
        height: "32px",
        lineHeight: "32px",
        borderRadius: 5,
        padding: "0 16px"
      }} >{showSecret ? secret : secret.slice(0, 5) + secret.slice(5).split("").map(() => "*").join("")}</span>
      {showSecret ? <EyeInvisibleOutlined onClick={() => setShowSecret(false)} /> : <EyeOutlined onClick={() => setShowSecret(true)} />}
    </span>
  );
}

const SecretConfigure = ({ secrets, handleRemoveSecret, handleChangePrimarySecret, handleAddSecret }) => {

  const [modalVisible, setModalVisible] = useState(false);

  const columns = [
    {
      title: "Secret",
      render: (_, record) => <SecretValue secret={record.secret} />
    },
    {
      title: <span>Primary secret  <Tooltip placement="bottomLeft" title="Primary secret is used by the user management module of API gateway to sign tokens on successful signup/signin requests.">
        <QuestionCircleOutlined />
      </Tooltip></span>,
      render: (_, record) => {
        return <Radio
          checked={record.isPrimary}
          onChange={!record.isPrimary ? () => handleChangePrimarySecret(record.secret) : undefined} />
      }
    },
    {
      title: "Actions",
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title={record.isPrimary ? "You are deleting primary secret. Any remaining secret will be randomly chosen as primary key." : "Tokens signed with this secret will stop getting verified"}
              onConfirm={() => handleRemoveSecret(record.secret)}
            >
              <a style={{ color: "red" }}>Remove</a>
            </Popconfirm>
          </span>
        )
      }
    }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ display: "inline-block" }}>JWT Secrets</h2>
        <Button onClick={() => setModalVisible(true)}>
          Add
        </Button>
      </div>
      <p>These secrets are used by the auth module in Space Cloud to verify the JWT token for all API requests</p>
      <Alert
        description="Space Cloud supports multiple JWT secrets to safely rotate them"
        type="info"
        showIcon
      />
      <Table
        style={{ marginTop: 16 }}
        columns={columns}
        dataSource={secrets}
        bordered={true}
        pagination={false}
        rowKey="key"
      />
      {modalVisible && <AddSecretModal
        handleSubmit={handleAddSecret}
        handleCancel={() => setModalVisible(false)} />}
    </div>
  )
}

export default SecretConfigure;