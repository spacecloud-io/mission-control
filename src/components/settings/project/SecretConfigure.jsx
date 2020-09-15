import React, { useState } from 'react'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip, Button, Radio, Alert, Popconfirm, Table, Modal, Input, Checkbox, Select, Typography, Spin } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { generateJWTSecret } from '../../../utils';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import keypair from "keypair";
import forge from "node-forge"

const generateRSAPrivateKey = () => {
  return keypair().private
}

const generateRSAPublicKeyFromPrivateKey = (privateKey) => {
  var forgePrivateKey = forge.pki.privateKeyFromPem(privateKey);

  // get a Forge public key from the Forge private key
  var forgePublicKey = forge.pki.setRsaPublicKey(forgePrivateKey.n, forgePrivateKey.e);

  // convert the Forge public key to a PEM-formatted public key
  var publicKey = forge.pki.publicKeyToPem(forgePublicKey);
  return publicKey
}


const AddSecretModal = ({ handleSubmit, handleCancel }) => {
  const [form] = Form.useForm();

  const [isPrivateKeyLoading, setPrivateKeyLoading] = useState(false);

  const handleSubmitClick = (e) => {
    form.validateFields().then(values => {
      const { alg, privateKey } = values;
      values.publicKey = alg === "RS256" && privateKey ? generateRSAPublicKeyFromPrivateKey(privateKey) : values.publicKey
      handleSubmit(values).then(() => handleCancel())
    });
  };

  const onAlgorithmChange = (alg) => {
    if (alg === "RS256") {
      setPrivateKeyLoading(true);
      // We had to use this timeout to prevent the UI from freezing
      setTimeout(async () => {
        const privateKey = await generateRSAPrivateKey();
        form.setFieldsValue({ privateKey })
        setPrivateKeyLoading(false);
      }, 500)
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
            <Select.Option value="JWK-URL">JWK-URL</Select.Option>
            <Select.Option value="RS256-PUBLIC">RS256-PUBLIC</Select.Option>
          </Select>
        </Form.Item>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "HS256"}>
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
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "RS256"}>
          <FormItemLabel name="Private key" />
          <Form.Item name="privateKey">
            {
              isPrivateKeyLoading ?
              <span><Spin className='page-loading' spinning={true} size="large" /> Generating Private Key......</span> :
              <Input.TextArea rows={4} placeholder="Private key" />
            }
          </Form.Item>
          <FormItemLabel name="Primary secret" />
          <Form.Item name="isPrimary" valuePropName="checked">
            <Checkbox >Use this secret in user management module of API gateway to sign tokens on successful signup/signin requests</Checkbox>
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "JWK-URL"}>
          <FormItemLabel name="JWK URL"/>
          <Form.Item name="jwkUrl" rules={[{ required: true, message: 'Please provide an URL' }]}>
            <Input placeholder="JWK URL" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "RS256-PUBLIC"}>
          <FormItemLabel name="Public key" />
          <Form.Item name="publicKey">
            <Input.TextArea rows={4} placeholder="Public key" />
          </Form.Item>
        </ConditionalFormBlock>
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
      {secretData.alg === "JWK-URL" && (
        <React.Fragment>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.jwkUrl }} strong>URL</Typography.Paragraph>
          <Input value={secretData.jwkUrl} />
        </React.Fragment>
      )}
      {secretData.alg === "RS256-PUBLIC" && (
        <React.Fragment>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.publicKey }} strong>Public key</Typography.Paragraph>
          <div style={{ marginBottom: 24 }}><Input.TextArea rows={4} value={secretData.publicKey} /></div>
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

  const handleViewClick = (values) => {
    setSecretData(values);
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
        if (record.alg === "JWK-URL" || record.alg === "RS256-PUBLIC") return <span>N/A</span>
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
            <a onClick={() => handleViewClick(record)}>View</a>
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