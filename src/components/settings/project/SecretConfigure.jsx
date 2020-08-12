import React, { useState } from 'react'
import { EyeInvisibleOutlined, EyeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip, Button, Radio, Alert, Popconfirm, Table, Modal, Input, Checkbox, Select } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { generateJWTSecret, generateKeyPairs } from '../../../utils';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';

const AddSecretModal = ({ handleSubmit, handleCancel }) => {
  const [form] = Form.useForm();
  const handleSubmitClick = (e) => {
    form.validateFields().then(values => {
      const { secret, isPrimary, alg, publicKey, privateKey } = values;
      handleSubmit(secret, isPrimary, alg, publicKey, privateKey).then(() => handleCancel())
    });
  };

  const onAlgorithmChange = (alg) => {
    if (alg === "RS256") {
      form.setFieldsValue({
        publicKey: generateKeyPairs().public,
        privateKey: generateKeyPairs().private
      })
    }
  }

  return (
    <Modal
      title="Add secret"
      okText="Add"
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ alg: "HS256", secret: generateJWTSecret(), isPrimary: true }}
      >
        <FormItemLabel name="Algorithm" />
        <Form.Item name="alg">
          <Select onChange={onAlgorithmChange}>
            <Select.Option value="HS256">HS256</Select.Option>
            <Select.Option value="RS256">RS256</Select.Option>
          </Select>
        </Form.Item>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "HS256"}>
          <FormItemLabel name="Secret" />
          <Form.Item name="secret"
            rules={[{ required: true, message: 'Please provide a secret' }]}
          >
            <Input.Password className="input" placeholder="Secret value" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "RS256"}>
          <FormItemLabel name="Public key" />
          <Form.Item name="publicKey">
            <Input.TextArea rows={4} placeholder="Public key" />
          </Form.Item>
          <FormItemLabel name="Private key" />
          <Form.Item name="privateKey">
            <Input.TextArea rows={4} placeholder="Private key" />
          </Form.Item>
        </ConditionalFormBlock>
        <FormItemLabel name="Primary secret" />
        <Form.Item name="isPrimary" valuePropName="checked">
          <Checkbox >Use this secret in user management module of API gateway to sign tokens on successful signup/signin requests</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  )
}

const ViewSecretModal = ({ secretData, handleCancel }) => {
  return (
    <Modal
      title="View secret"
      visible={true}
      footer={null}
      onCancel={handleCancel}
    >
      <FormItemLabel name="Algorithm" />
      <div style={{marginBottom: 24}}>{secretData.alg}</div>
      {secretData.alg === "HS256" && (
        <React.Fragment>
          <FormItemLabel name="Secret"/>
          <div>{secretData.secret}</div>
        </React.Fragment>
      )}
      {secretData.alg === "RS256" && (
        <React.Fragment>
          <FormItemLabel name="Public key"/>
          <div style={{marginBottom: 24}}>{secretData.publicKey}</div>
          <FormItemLabel name="Private key"/>
          <div>{secretData.privateKey}</div>
        </React.Fragment>
      )}
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
      }} >{showSecret ? secret : secret.slice(0, 4) + secret.slice(4).split("").map(() => "*").join("")}</span>
      {showSecret ? <EyeInvisibleOutlined onClick={() => setShowSecret(false)} /> : <EyeOutlined onClick={() => setShowSecret(true)} />}
    </span>
  );
}

const SecretConfigure = ({ secrets, handleRemoveSecret, handleChangePrimarySecret, handleAddSecret }) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [secretData, setSecretData] = useState({});

  const handleViewClick = (alg, secret, publicKey, privateKey) => {
    setSecretData({ alg, secret, publicKey, privateKey });
    setViewModal(true);
  }

  const columns = [
    {
      title: 'Algorithm',
      dataIndex: 'alg'
    },
    /* {
      title: "Secret",
      render: (_, record) => <SecretValue secret={record.secret} />
    }, */
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
      className: 'column-actions',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title={record.isPrimary ? "You are deleting primary secret. Any remaining secret will be randomly chosen as primary key." : "Tokens signed with this secret will stop getting verified"}
              onConfirm={() => handleRemoveSecret(record.secret)}
            >
              <a style={{ color: "red" }}>Remove</a>
            </Popconfirm>
            <a onClick={() => handleViewClick(record.alg, record.secret, record.publicKey, record.privateKey)}>View</a>
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
      {viewModal && <ViewSecretModal
        secretData={secretData}
        handleCancel={() => setViewModal(false)}
      />}
    </div>
  )
}

export default SecretConfigure;