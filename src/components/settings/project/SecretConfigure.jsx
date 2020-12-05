import React, { useState } from 'react'
import { QuestionCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Tooltip, Button, Radio, Alert, Popconfirm, Table, Modal, Input, Checkbox, Select, Typography, Spin, Collapse } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import { generateJWTSecret } from '../../../utils';
import ConditionalFormBlock from '../../conditional-form-block/ConditionalFormBlock';
import keypair from "keypair";
import forge from "node-forge"
import { generateId } from 'space-api/dist/lib/utils';

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


const AddSecretModal = ({ handleSubmit, handleCancel, initialValues }) => {
  const [form] = Form.useForm();

  const [isPrivateKeyLoading, setPrivateKeyLoading] = useState(false);

  const formInitialValues = {
    alg: initialValues ? initialValues.alg : "HS256",
    secret: initialValues ? initialValues.secret : generateJWTSecret(),
    privateKey: initialValues ? initialValues.privateKey : undefined,
    publicKey: initialValues ? initialValues.publicKey : undefined,
    jwkUrl: initialValues ? initialValues.jwkUrl : undefined,
    isPrimary: initialValues ? initialValues.isPrimary : false,
    checkAudience: initialValues && initialValues.aud && initialValues.aud.length > 0 ? true : false,
    checkIssuer: initialValues && initialValues.iss ? true : false,
    aud: initialValues && initialValues.aud ? initialValues.aud : [""],
    iss: initialValues && initialValues.iss ? initialValues.iss : [""],
    kid: initialValues && initialValues.kid ? initialValues.kid : generateId()
  }

  const handleSubmitClick = (e) => {
    form.validateFields().then(values => {
      values = Object.assign({}, formInitialValues, values)
      let { alg, secret, privateKey, publicKey, jwkUrl, isPrimary, checkAudience, checkIssuer, aud, iss, kid } = values;
      if (alg === "RS256" && privateKey) {
        publicKey = generateRSAPublicKeyFromPrivateKey(privateKey)
      }
      if (!checkAudience) {
        aud = undefined
      }
      if (!checkIssuer) {
        iss = undefined
      }
      let obj = {}
      switch (alg) {
        case "HS256":
          obj = { alg, secret, isPrimary, aud, iss, kid }
          break
        case "RS256":
          obj = { alg, publicKey, privateKey, isPrimary, aud, iss, kid }
          break
        case "RS256_PUBLIC":
          obj = { alg, publicKey, aud, iss, kid }
          break
        case "JWK_URL":
          obj = { alg, jwkUrl, aud, iss }
          break
      }
      handleSubmit(obj).then(() => handleCancel())
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
      okText={initialValues ? "Save" : "Add"}
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
      width={720}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={formInitialValues}
      >
        <FormItemLabel name="Algorithm" />
        <Form.Item name="alg">
          <Select onChange={onAlgorithmChange}>
            <Select.Option value="HS256">HS256</Select.Option>
            <Select.Option value="RS256">RS256</Select.Option>
            <Select.Option value="RS256_PUBLIC">RS256 PUBLIC</Select.Option>
            <Select.Option value="JWK_URL">JWK URL</Select.Option>
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
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "JWK_URL"}>
          <FormItemLabel name="JWK URL" />
          <Form.Item name="jwkUrl" rules={[{ required: true, message: 'Please provide an URL' }]}>
            <Input placeholder="JWK URL" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="alg" condition={() => form.getFieldValue("alg") === "RS256_PUBLIC"}>
          <FormItemLabel name="Public key" />
          <Form.Item name="publicKey">
            <Input.TextArea rows={4} placeholder="Public key" />
          </Form.Item>
        </ConditionalFormBlock>
        <Collapse style={{ background: "white" }} bordered={false} >
          <Collapse.Panel header="Advanced" key="advanced">
            <FormItemLabel name='Check audience' />
            <Form.Item name='checkAudience' valuePropName='checked'>
              <Checkbox>
                Check audience while verifying JWT token
              </Checkbox>
            </Form.Item>
            <ConditionalFormBlock
              dependency='checkAudience'
              condition={() => form.getFieldValue('checkAudience') === true}
            >
              <FormItemLabel name="Specify audiences" description="The audience check will pass if the JWT matches any one of the specified audiences below" />
              <Form.List name="aud">
                {(fields, { add, remove }) => {
                  return (
                    <div>
                      {fields.map((field) => (
                        <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                          <Form.Item
                            {...field}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[
                              {
                                required: true,
                                message: "Please input a value",
                              }
                            ]}
                            noStyle
                          >
                            <Input placeholder="Audience value" style={{ width: "90%" }} />
                          </Form.Item>
                          {fields.length > 1 ? <DeleteOutlined
                            style={{ marginLeft: 16 }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          /> : null}
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button onClick={() => {
                          form.validateFields(fields.map(obj => ["aud", obj.name]))
                            .then(() => add())
                            .catch(ex => console.log("Exception", ex))
                        }}>
                          <PlusOutlined /> Add
                        </Button>
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.List>
            </ConditionalFormBlock>
            <FormItemLabel name='Check issuer' />
            <Form.Item name='checkIssuer' valuePropName='checked'>
              <Checkbox>
                Check issuer while verifying JWT token
              </Checkbox>
            </Form.Item>
            <ConditionalFormBlock
              dependency='checkIssuer'
              condition={() => form.getFieldValue('checkIssuer') === true}
            >
              <FormItemLabel name="Specify issuers" description="The issuer check will pass if the JWT matches any one of the specified issuers below" />
              <Form.List name="iss">
                {(fields, { add, remove }) => {
                  return (
                    <div>
                      {fields.map((field) => (
                        <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                          <Form.Item
                            {...field}
                            validateTrigger={['onChange', 'onBlur']}
                            rules={[
                              {
                                required: true,
                                message: "Please input a value",
                              }
                            ]}
                            noStyle
                          >
                            <Input placeholder="Issuer value" style={{ width: "90%" }} />
                          </Form.Item>
                          {fields.length > 1 ? <DeleteOutlined
                            style={{ marginLeft: 16 }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          /> : null}
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button onClick={() => {
                          form.validateFields(fields.map(obj => ["iss", obj.name]))
                            .then(() => add())
                            .catch(ex => console.log("Exception", ex))
                        }}>
                          <PlusOutlined /> Add
                        </Button>
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.List>
            </ConditionalFormBlock>
            <ConditionalFormBlock
              dependency="alg"
              condition={() => form.getFieldValue("alg") !== "JWK_URL"}>
              <FormItemLabel name="kid" hint="(key ID)" />
              <Form.Item name="kid" rules={[{ required: true, message: "Please input a value!" }]}>
                <Input placeholder="kid" />
              </Form.Item>
            </ConditionalFormBlock>
          </Collapse.Panel>
        </Collapse>
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
      {secretData.alg === "JWK_URL" && (
        <React.Fragment>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.jwkUrl }} strong>URL</Typography.Paragraph>
          <Input value={secretData.jwkUrl} />
        </React.Fragment>
      )}
      {secretData.alg === "RS256_PUBLIC" && (
        <React.Fragment>
          <Typography.Paragraph style={{ fontSize: 16 }} copyable={{ text: secretData.publicKey }} strong>Public key</Typography.Paragraph>
          <div style={{ marginBottom: 24 }}><Input.TextArea rows={4} value={secretData.publicKey} /></div>
        </React.Fragment>
      )}
    </Modal>
  )
}

const SecretConfigure = ({ secrets, handleRemoveSecret, handleChangePrimarySecret, handleSaveSecret }) => {

  // For backword compatibility assume the `alg` as `HS256`
  const secretsData = secrets.map(obj => Object.assign({}, obj, { alg: obj.alg ? obj.alg : "HS256" }))

  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [viewSecretModalVisible, setViewSecretModalVisible] = useState(false);
  const [secretClickedIndex, setSecretClickedIndex] = useState(undefined);
  const secretClickedDetails = secretClickedIndex !== undefined ? secretsData[secretClickedIndex] : null

  const handleViewClick = (index) => {
    setSecretClickedIndex(index)
    setViewSecretModalVisible(true)
  }

  const handleEditClick = (index) => {
    setSecretClickedIndex(index)
    setSecretModalVisible(true)
  }

  const handleCancel = () => {
    setSecretModalVisible(false)
    setSecretClickedIndex(undefined)
  }

  const handleCancelView = () => {
    setViewSecretModalVisible(false)
    setSecretClickedIndex(undefined)
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
        if (record.alg === "JWK_URL" || record.alg === "RS256_PUBLIC") return <span>N/A</span>
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
            <a onClick={() => handleViewClick(index)}>View</a>
            <a onClick={() => handleEditClick(index)}>Edit</a>
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
        <Button onClick={() => setSecretModalVisible(true)}>
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
      {secretModalVisible && <AddSecretModal
        initialValues={secretClickedDetails}
        handleSubmit={(values) => handleSaveSecret(values, secretClickedIndex)}
        handleCancel={handleCancel} />}
      {viewSecretModalVisible && <ViewSecretModal
        secretData={secretClickedDetails}
        handleCancel={handleCancelView} />}
    </div>
  )
}

export default SecretConfigure;