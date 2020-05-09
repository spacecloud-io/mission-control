import React, { useState } from 'react'
import { EyeInvisibleOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip, Button, Radio, Alert, Popconfirm, Table, Modal, Input, Checkbox } from 'antd';
import FormItemLabel from "../../components/form-item-label/FormItemLabel";
import { generateJWTSecret, notify } from '../../utils';

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

const SecretConfigure = ({ secrets, handleSetSecrets }) => {

  const [modalVisible, setModalVisible] = useState(false);

  const handleRemoveSecret = (secret) => {
    const newSecrets = secrets.filter((obj) => obj.secret !== secret)
    const primarySecretPresent = newSecrets.some(obj => obj.isPrimary)
    if (!primarySecretPresent && newSecrets.length > 0) newSecrets[0].isPrimary = true
    handleSetSecrets(newSecrets)
      .then(() => notify("success", "Success", "Removed secret successfully"))
      .catch(ex => notify("error", "Error removing secret", ex.toString()))
  }

  const handleChangePrimarySecret = (secret) => {
    const newSecrets = secrets.map(obj => Object.assign({}, obj, { isPrimary: obj.secret === secret ? true : false }))
    handleSetSecrets(newSecrets)
      .then(() => notify("success", "Success", "Changed primary secret successfully"))
      .catch(ex => notify("error", "Error changing primary secret", ex.toString()))
  }

  const handleAddSecret = (secret, isPrimary) => {
    const oldSecrets = isPrimary ? secrets.map(obj => Object.assign({}, obj, { isPrimary: false })) : secrets
    const newSecret = { secret, isPrimary }
    const newSecrets = [...oldSecrets, newSecret]

    return new Promise((resolve, reject) => {
      handleSetSecrets(newSecrets)
        .then(() => {
          notify("success", "Success", "Added new secret successfully")
          resolve()
        })
        .catch(ex => {
          notify("error", "Error adding secret", ex.toString())
          reject()
        })
    })
  }

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