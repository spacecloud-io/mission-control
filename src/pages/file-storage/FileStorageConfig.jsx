import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { LeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { useHistory } from "react-router-dom";
import { Button, Card, Input, Radio, Form, Alert, AutoComplete, Col, Collapse, Checkbox } from "antd"
import RadioCards from "../../components/radio-cards/RadioCards"
import FormItemLabel from "../../components/form-item-label/FormItemLabel"
import ConditionalFormBlock from "../../components/conditional-form-block/ConditionalFormBlock";
import { saveFileStoreConfig, getFileStoreConfig } from '../../operations/fileStore';
import { getSecrets, loadSecrets } from '../../operations/secrets';
import { projectModules, actionQueuedMessage, fileStoreProviders } from '../../constants';

const FileStorageConfig = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  // Router params
  const { projectID } = useParams()

  // Global state
  const { storeType, bucket, endpoint, conn, secret, disableSSL, forcePathStyle } = useSelector(state => getFileStoreConfig(state))
  const secrets = useSelector(state => getSecrets(state))

  const fileSecrets = secrets.filter(secret => secret.type === 'file')
  let fileSecretsAutoCompleteOptions = []
  fileSecrets.forEach(({ id, data }) => {
    Object.keys(data).forEach((key) => {
      fileSecretsAutoCompleteOptions.push({ value: `secrets.${id}.${key}` })
    })
  })

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecrets(projectID)
        // .catch(ex => notify("error", "Error fetching secrets", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  const initialStoreType = storeType ? storeType : fileStoreProviders.LOCAL
  const formInitialValues = {
    storeType: initialStoreType,
    localConn: initialStoreType === fileStoreProviders.LOCAL ? conn : undefined,
    s3Conn: initialStoreType === fileStoreProviders.AMAZON_S3 ? conn : undefined,
    s3Bucket: initialStoreType === fileStoreProviders.AMAZON_S3 ? bucket : undefined,
    gcpBucket: initialStoreType === fileStoreProviders.GCP_STORAGE ? bucket : undefined,
    endpoint: endpoint,
    credentials: (storeType && !secret) ? "direct" : "secret",
    secret: secret,
    disableSSL,
    forcePathStyle
  }

  // This is used to bind the form initial values on page reload. 
  // On page reload the redux is intially empty leading the form initial values to be empty. 
  // Hence as soon as redux gets the desired value, we set the form values    
  useEffect(() => {
    if (storeType) {
      form.setFieldsValue(formInitialValues)
    }
  }, [storeType])

  // Handlers
  const handleFinish = (values) => {
    values = Object.assign({}, formInitialValues, values)
    let newConfig = {};
    switch (values.storeType) {
      case fileStoreProviders.LOCAL:
        newConfig = {
          enabled: true,
          conn: values.localConn
        }
        break;

      case fileStoreProviders.AMAZON_S3:
        newConfig = {
          enabled: true,
          conn: values.s3Conn,
          bucket: values.s3Bucket,
          endpoint: values.endpoint,
          disableSSL: values.disableSSL,
          forcePathStyle: values.forcePathStyle
        }
        if (values.credentials === "secret") {
          newConfig.secret = values.secret
        }
        break;

      case fileStoreProviders.GCP_STORAGE:
        newConfig = {
          enabled: true,
          bucket: values.gcpBucket,
        }
        if (values.credentials === "secret") {
          newConfig.secret = values.secret
        }
        break;

      default:
        break;
    }
    incrementPendingRequests()
    saveFileStoreConfig(projectID, newConfig)
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : "Configured file storage successfully")
        form.resetFields();
        history.goBack();
      })
      .catch(ex => notify("error", "Error configuring file storage", ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <div className="file-storage">
      <Topbar showProjectSelector />
      <div>
        <Sidenav selectedItem={projectModules.FILESTORE} />
        <div className="page-content page-content--no-padding">
          <div
            style={{
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
              height: 48,
              lineHeight: 48,
              zIndex: 98,
              display: "flex",
              alignItems: "center",
              padding: "0 16px"
            }}
          >
            <Button type="link" onClick={() => history.goBack()}>
              <LeftOutlined />
                            Go back
                        </Button>
            <span style={{ marginLeft: "35%" }}>Configure file storage</span>
          </div>
          <Col sm={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 14, offset: 5 }}>
            <Card>
              <Form layout="vertical" form={form}
                initialValues={formInitialValues}
                onFinish={handleFinish}>
                <FormItemLabel name="Choose storage backend" />
                <Form.Item name="storeType" rules={[{ required: true, message: 'Please select a storage backend!' }]}>
                  <RadioCards>
                    <Radio.Button value={fileStoreProviders.LOCAL}>Local File Store</Radio.Button>
                    <Radio.Button value={fileStoreProviders.AMAZON_S3}>Amazon S3</Radio.Button>
                    <Radio.Button value={fileStoreProviders.GCP_STORAGE}>Google Cloud Storage</Radio.Button>
                  </RadioCards>
                </Form.Item>
                <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === fileStoreProviders.LOCAL}>
                  <FormItemLabel name="Directory path" />
                  <Form.Item name="localConn" rules={[{ required: true, message: 'Please provide a directory path!' }]}>
                    <Input placeholder="Example: /home/user/my-folder" />
                  </Form.Item>
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === fileStoreProviders.AMAZON_S3}>
                  <FormItemLabel name="Bucket" />
                  <Form.Item name="s3Bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
                    <Input placeholder="Example: my-bucket" />
                  </Form.Item>
                  <FormItemLabel name="Region" />
                  <Form.Item name="s3Conn" rules={[{ required: true, message: 'Please provide a region!' }]} shouldUpdate>
                    <Input placeholder="Example: us-east-1" />
                  </Form.Item>
                  <FormItemLabel name="Credentials File" description="Credentials file is used to authorize Space Cloud to your bucket" />
                  <Form.Item name="credentials">
                    <Radio.Group>
                      <Radio style={{ display: 'block' }} value="secret">Load from Space Cloud Secrets <span style={{ fontWeight: 'bold' }}>(recommended method)</span></Radio>
                      <Radio style={{ display: 'block', marginTop: 8 }} value="direct">Load Directly</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <ConditionalFormBlock dependency="credentials" condition={() => form.getFieldValue("credentials") === "secret"}>
                    <Alert
                      message="Prerequisite"
                      description="Make sure that you have stored the S3 credentials file in a Space Cloud Secret and specified that secret below before saving this configuration. Space Cloud will automatically pull the credentials file from the specified secret."
                      type="info"
                      showIcon
                    />
                    <p style={{ fontSize: "16px", marginTop: "21px", fontWeight: "bold" }}> Choose a secret </p>
                    <Form.Item rules={[{ required: true, message: 'Please provide a secret' }]} name="secret">
                      <AutoComplete options={fileSecretsAutoCompleteOptions} style={{ width: "300px" }} placeholder="Please select" />
                    </Form.Item>
                  </ConditionalFormBlock>
                  <ConditionalFormBlock dependency="credentials" condition={() => form.getFieldValue("credentials") === "direct"}>
                    <Alert
                      style={{ marginBottom: "3%" }}
                      message="Prerequisite"
                      description={<div> Make sure that you have stored S3 credentials file at <b> /root/.aws/credentials </b> of Space Cloud Gateway before saving this configuration. Space Cloud will drectly load the credentials from there.</div>}
                      type="info"
                      showIcon
                    />
                  </ConditionalFormBlock>
                  <Collapse
                    style={{ background: "white" }}
                    bordered={false}
                    expandIcon={({ isActive }) => (
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                  >
                    <Collapse.Panel header="Advanced settings" key="advanced">
                      <FormItemLabel name="Endpoint" hint="(Optional)" />
                      <Form.Item name="endpoint">
                        <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
                      </Form.Item>
                      <FormItemLabel name="SSL" hint="(Optional)" />
                      <Form.Item name="disableSSL" valuePropName="checked">
                        <Checkbox>
                          Disable SSL
                        </Checkbox>
                      </Form.Item>
                      <FormItemLabel name="Path style" hint="(Optional)" />
                      <Form.Item name="forcePathStyle" valuePropName="checked">
                        <Checkbox>
                          Force path style
                        </Checkbox>
                      </Form.Item>
                    </Collapse.Panel>
                  </Collapse>
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === fileStoreProviders.GCP_STORAGE}>
                  <FormItemLabel name="Bucket" />
                  <Form.Item name="gcpBucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
                    <Input placeholder="Example: my-bucket" />
                  </Form.Item>
                  <FormItemLabel name="Credentials File" description="Credentials file is used to authorize Space Cloud to your bucket" />
                  <Form.Item name="credentials">
                    <Radio.Group defaultValue="secret">
                      <Radio style={{ display: 'block' }} value="secret">Load from Space Cloud Secrets <span style={{ fontWeight: 'bold' }}>(recommended method)</span></Radio>
                      <Radio style={{ display: 'block', marginTop: 8 }} value="direct">Load Directly</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <ConditionalFormBlock dependency="credentials" condition={() => form.getFieldValue("credentials") === "secret"}>
                    <Alert
                      message="Prerequisite"
                      description="Make sure that you have stored the GCS credentials file in a Space Cloud Secret and specified that secret below before saving this configuration. Space Cloud will pull the credentials file from the specified secret."
                      type="info"
                      showIcon
                    />
                    <p style={{ fontSize: "16px", marginTop: "21px", fontWeight: "bold" }}> Choose a secret </p>
                    <Form.Item rules={[{ required: true, message: 'Please provide a secret' }]} name="secret">
                      <AutoComplete options={fileSecretsAutoCompleteOptions} style={{ width: "300px" }} placeholder="Please select" />
                    </Form.Item>
                  </ConditionalFormBlock>
                  <ConditionalFormBlock dependency="credentials" condition={() => form.getFieldValue("credentials") === "direct"}>
                    <Alert
                      style={{ marginBottom: "3%" }}
                      message="Prerequisite"
                      description={<div> Make sure that you have stored the GCS credentials file in a path accessible to the Space Cloud Gateway and started the Gateway with the <b> GOOGLE_APPLICATION_CREDENTIALS </b> environment (pointing to the credentials file path) before saving this configuration. Space Cloud will load the credentials from the path specified in this environment variable.</div>}
                      type="info"
                      showIcon
                    />
                  </ConditionalFormBlock>
                </ConditionalFormBlock>
                <Form.Item style={{ marginTop: 24 }}>
                  <Button type="primary" htmlType="submit" className="submit" block>
                    Save
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </div>
      </div>
    </div >
  )
}

export default FileStorageConfig;