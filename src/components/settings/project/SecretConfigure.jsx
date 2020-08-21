import React, { useState } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip, Button, Radio, Alert, Popconfirm, Table, Modal, Input, Checkbox, Select, Typography } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { generateJWTSecret, generateRSAKeyPair, generateRSAPublicKeyFromPrivateKey, generateRSAPrivateKey } from '../../../utils';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';


const AddSecretModal = ({ handleSubmit, handleCancel }) => {
  const [form] = Form.useForm();
  const handleSubmitClick = (e) => {
    form.validateFields().then(values => {
      const { secret, isPrimary, alg, privateKey } = values;
      const publicKey = generateRSAPublicKeyFromPrivateKey(privateKey)
      handleSubmit(secret, isPrimary, alg, publicKey, privateKey).then(() => handleCancel())
    });
  };

  const onAlgorithmChange = async (alg) => {
    if (alg === "RS256") {
      const privateKey = await generateRSAPrivateKey();
      form.setFieldsValue({ privateKey })
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
          {/* <FormItemLabel name="Public key" />
          <Form.Item name="publicKey">
            <Input.TextArea rows={4} placeholder="Public key" />
          </Form.Item> */}
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
      width={720}
    >
      <Typography.Paragraph style={{ fontSize: 16 }} strong>Algorithm</Typography.Paragraph>
      <div style={{ marginBottom: 24 }}>{secretData.alg}</div>
      {secretData.alg === "HS256" && (
        <React.Fragment>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.secret }} strong>Secret</Typography.Paragraph>
          <Input value={secretData.secret} />
        </React.Fragment>
      )}
      {secretData.alg === "RS256" && (
        <React.Fragment>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.publicKey }} strong>Public key</Typography.Paragraph>
          <div style={{ marginBottom: 24 }}><Input.TextArea rows={4} value={secretData.publicKey} /></div>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.privateKey }} strong>Private key</Typography.Paragraph>
          <div style={{ marginBottom: 24 }}><Input.TextArea rows={4} value={secretData.privateKey} /></div>
        </React.Fragment>
      )}
    </Modal>
  )
}

const SecretConfigure = ({ secrets, handleRemoveSecret, handleChangePrimarySecret, handleAddSecret }) => {

  // For backword compatibility assume the `alg` as `HS256`
  const secretsData = secrets.map(obj => Object.assign({}, obj, { alg: obj.alg ? obj.alg : "HS256" }))

  const [addSecretModalVisible, setAddSecretModalVisible] = useState(false);
  const [viewSecretModalVisible, setViewSecretModalVisible] = useState(false);
  const [secretData, setSecretData] = useState({});

  const handleViewClick = (alg, secret, publicKey, privateKey) => {
    setSecretData({ alg, secret, publicKey, privateKey });
    setViewSecretModalVisible(true);
  }

  const columns = [
    {
      title: 'Algorithm',
      dataIndex: 'alg'
    },
    {
      title: <span>Primary secret  <Tooltip placement="bottomLeft" title="Primary secret is used by the user management module of API gateway to sign tokens on successful signup/signin requests.">
        <QuestionCircleOutlined />
      </Tooltip></span>,
      render: (_, record, index) => {
        return <Radio
          checked={record.isPrimary}
          onChange={!record.isPrimary ? () => handleChangePrimarySecret(index) : undefined} />
      }
    },
    {
      title: "Actions",
      className: 'column-actions',
      render: (_, record, index) => {
        return (
          <span>
            <a onClick={() => handleViewClick(record.alg, record.secret, record.publicKey, record.privateKey)}>View</a>
            <Popconfirm
              title={record.isPrimary ? "You are deleting primary secret. Any remaining secret will be randomly chosen as primary key." : "Tokens signed with this secret will stop getting verified"}
              onConfirm={() => handleRemoveSecret(index)}
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
        <Button onClick={() => setAddSecretModalVisible(true)}>
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
        dataSource={secretsData}
        bordered={true}
        pagination={false}
        rowKey="key"
      />
      {addSecretModalVisible && <AddSecretModal
        handleSubmit={handleAddSecret}
        handleCancel={() => setAddSecretModalVisible(false)} />}
      {viewSecretModalVisible && <ViewSecretModal
        secretData={secretData}
        handleCancel={() => setViewSecretModalVisible(false)}
      />}
    </div>
  )
}

export default SecretConfigure;