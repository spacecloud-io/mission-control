import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector } from 'react-redux';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { LeftOutlined } from '@ant-design/icons';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { useHistory } from "react-router-dom";
import { Button, Card, Input, Radio, Form, Alert, Cascader, Col } from "antd"
import RadioCards from "../../components/radio-cards/RadioCards"
import FormItemLabel from "../../components/form-item-label/FormItemLabel"
import ConditionalFormBlock from "../../components/conditional-form-block/ConditionalFormBlock";
import { saveFileStoreConfig, getFileStoreConfig } from '../../operations/fileStore';
import { getSecrets, loadSecrets } from '../../operations/secrets';

const FileStorageConfig = () => {
  const [form] = Form.useForm();
  const history = useHistory();
  // Router params
  const { projectID } = useParams()

  // Global state
  const { storeType, bucket, endpoint, conn, secret } = useSelector(state => getFileStoreConfig(state))
  const secrets = useSelector(state => getSecrets(state))

  const getDataKeys = (fileSecret) => {
    const fileChildren = Object.keys(fileSecret.data)
      .map(keys => {
        return ({ "value": keys, "label": keys })
      })
    return fileChildren;
  }

  const fileSecrets = secrets.filter(secret => secret.type === 'file')
    .map(fileSecret => {
      return ({ "value": fileSecret.id, "label": fileSecret.id, "children": getDataKeys(fileSecret) })
    });

  useEffect(() => {
    ReactGA.pageview("/projects/file-storage/configure");
  }, [])

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecrets(projectID)
        // .catch(ex => notify("error", "Error fetching secrets", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  let initialSecretValue = ""
  if (secret) {
    const [_, secretName, ...secretKeyNameParts] = secret.split(".")
    initialSecretValue = [secretName, secretKeyNameParts.join(".")]
  }

  const formInitialValues = {
    storeType: storeType ? storeType : "local",
    conn: conn,
    bucket: bucket,
    endpoint: endpoint,
    credentials: (storeType && !secret) ? "direct" : "secret",
    secret: initialSecretValue
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
    if (values.credentials === "secret") {
      values.secret = `secrets.${values.secret[0]}.${values.secret[1]}`
    }
    delete values["credentials"]
    incrementPendingRequests()
    const newConfig = { enabled: true, ...values }

    saveFileStoreConfig(projectID, newConfig)
      .then(() => {
        notify("success", "Success", "Configured file storage successfully")
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
        <Sidenav selectedItem="file-storage" />
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
          <Col offset={6} style={{ marginTop: "2%" }}>
            <Card className="Card-align" style={{ width: 706 }}>
              <Form layout="vertical" form={form}
                initialValues={formInitialValues}
                onFinish={handleFinish}>
                <FormItemLabel name="Choose storage backend" />
                <Form.Item name="storeType" rules={[{ required: true, message: 'Please select a storage backend!' }]}>
                  <RadioCards>
                    <Radio.Button value="local">Local File Store</Radio.Button>
                    <Radio.Button value="amazon-s3">Amazon S3</Radio.Button>
                    <Radio.Button value="gcp-storage">Google Cloud Storage</Radio.Button>
                  </RadioCards>
                </Form.Item>
                <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "local"}>
                  <FormItemLabel name="Directory path" />
                  <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a directory path!' }]}>
                    <Input placeholder="Example: /home/user/my-folder" />
                  </Form.Item>
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "amazon-s3"}>
                  <FormItemLabel name="Bucket" />
                  <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
                    <Input placeholder="Example: my-bucket" />
                  </Form.Item>
                  <FormItemLabel name="Region" />
                  <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a region!' }]} shouldUpdate>
                    <Input placeholder="Example: us-east-1" />
                  </Form.Item>
                  <FormItemLabel name="Endpoint" description="Optional" />
                  <Form.Item name="endpoint">
                    <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
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
                      <Cascader options={fileSecrets} style={{ width: "300px" }} placeholder="Please select" />
                    </Form.Item>
                  </ConditionalFormBlock>
                  <ConditionalFormBlock dependency="credentials" condition={() => form.getFieldValue("credentials") === "direct"}>
                    <Alert
                      style={{ marginBottom: "3%" }}
                      message="Prerequisite"
                      description={<div> Make sure that you have stored S3 credentials file at <b> /root/.aws/credentals </b> of Space Cloud Gateway before saving this configuration. Space Cloud will drectly load the credentals from there.</div>}
                      type="info"
                      showIcon
                    />
                  </ConditionalFormBlock>
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "gcp-storage"}>
                  <FormItemLabel name="Bucket" />
                  <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
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
                      <Cascader options={fileSecrets} style={{ width: "300px" }} placeholder="Please select" />
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
                <Form.Item>
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