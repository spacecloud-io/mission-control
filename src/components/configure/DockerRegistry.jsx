import React, { useState } from 'react'
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Button, Modal, Select, Radio } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel";
import RadioCard from "../radio-card/RadioCard";

const { Option } = Select

const gcpRegions = ["us", "eu", "asia"]

const awsRegions = [
  {
    id: "us-east-2",
    name: "US East (Ohio)"
  },
  {
    id: "us-east-1",
    name: "US East (N. Virginia)"
  },
  {
    id: "us-west-1",
    name: "US West (N. California)"
  },
  {
    id: "us-west-2",
    name: "US West (Oregon)"
  },
  {
    id: "ap-east-1",
    name: "Asia Pacific (Hong Kong)"
  },
  {
    id: "ap-south-1",
    name: "Asia Pacific (Mumbai)"
  },
  {
    id: "ap-northeast-3",
    name: "Asia Pacific (Osaka-Local)"
  },
  {
    id: "ap-northeast-2",
    name: "Asia Pacific (Seoul)"
  },
  {
    id: "ap-southeast-1",
    name: "Asia Pacific (Singapore)"
  },
  {
    id: "ap-southeast-2",
    name: "Asia Pacific (Sydney)"
  },
  {
    id: "ap-northeast-1",
    name: "Asia Pacific (Tokyo)"
  },
  {
    id: "ca-central-1",
    name: "Canada (Central)"
  },
  {
    id: "eu-central-1",
    name: "Europe (Frankfurt)"
  },
  {
    id: "eu-west-1",
    name: "Europe (Ireland)"
  },
  {
    id: "eu-west-2",
    name: "Europe (London)"
  },
  {
    id: "eu-west-3",
    name: "Europe (Paris)"
  },
  {
    id: "eu-north-1",
    name: "Europe (Stockholm)"
  },
  {
    id: "me-south-1",
    name: "Middle East (Bahrain)"
  },
  {
    id: "sa-east-1",
    name: "South America (São Paulo)"
  }
]

const gcrRegionOptions = gcpRegions.map(region => <Option key={region} value={region}>{region}</Option>)
const ecrRegionOptions = awsRegions.map(region => <Option key={region.id} value={region.id}>{region.name}</Option>)

const DockerRegistryModal = ({ form, handleSubmit, handleCancel }) => {

  const { getFieldDecorator, getFieldValue } = form

  const handleSubmitClick = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const registryType = values["registryType"]
        let registryValue = ""
        switch (registryType) {
          case "gcr":
            registryValue = `${values["gcrRegion"]}.gcr.io/${values["gcrProject"]}`
            break
          case "ecr":
            registryValue = `https://${values["awsAccountId"]}.dkr.ecr.${values["ecrRegion"]}.amazonaws.com`
            break
          case "acr":
            registryValue = `${values["acrRegistryName"]}.azurecr.io`
            break
          default:
            registryValue = values["registryValue"]
        }
        handleSubmit(registryValue)
        handleCancel()
      }
    });
  };


  return (
    <Modal
      title="Configure Docker Registry"
      okText="Save"
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
    >
      <Form layout="vertical" onSubmit={handleSubmit}>
        <FormItemLabel name="Choose Registry Service" />
        <Form.Item>
          {getFieldDecorator('registryType', {
            rules: [{ required: true, message: 'Please select a registry service!' }],
            initialValue: "gcr"
          })(
            <Radio.Group>
              <RadioCard value="gcr">Google GCR</RadioCard>
              <RadioCard value="ecr">AWS ECR</RadioCard>
              <RadioCard value="acr">Azure ACR</RadioCard>
              <RadioCard value="others">Others</RadioCard>
            </Radio.Group>
          )}
        </Form.Item>
        {(getFieldValue("registryType") === "gcr" || !getFieldValue("registryType")) && <React.Fragment>
          <FormItemLabel name="GCP Region" />
          <Form.Item>
            {getFieldDecorator('gcrRegion', {
              rules: [{ required: true, message: 'Please provide a region!' }]
            })(
              <Select placeholder="Select a region" >
                {gcrRegionOptions}
              </Select>
            )}
          </Form.Item>
          <FormItemLabel name="GCP Project" />
          <Form.Item>
            {getFieldDecorator('gcrProject', {
              rules: [{ required: true, message: 'Please provide project id of your gcp project!' }]
            })(
              <Input placeholder="Example: my-project-123456" />
            )}
          </Form.Item>
        </React.Fragment>}
        {getFieldValue("registryType") === "ecr" && <React.Fragment>
          <FormItemLabel name="AWS Region" />
          <Form.Item>
            {getFieldDecorator('ecrRegion', {
              rules: [{ required: true, message: 'Please provide a region!' }]
            })(
              <Select placeholder="Select a region" >
                {ecrRegionOptions}
              </Select>
            )}
          </Form.Item>
          <FormItemLabel name="AWS Account ID" />
          <Form.Item>
            {getFieldDecorator('awsAccountId', {
              rules: [{ required: true, message: 'Please provide your aws account id' }]
            })(
              <Input placeholder="Example: 563789405948" />
            )}
          </Form.Item>
        </React.Fragment>}
        {getFieldValue("registryType") === "acr" && <React.Fragment>
          <FormItemLabel name="ACR Registry name" />
          <Form.Item>
            {getFieldDecorator('acrRegistryName', {
              rules: [{ required: true, message: 'Please provide your registry name' }]
            })(
              <Input placeholder="Example: mycontainerregistry007" />
            )}
          </Form.Item>
        </React.Fragment>}
        {getFieldValue("registryType") === "others" && <React.Fragment>
          <FormItemLabel name="Docker Registry" />
          <Form.Item>
            {getFieldDecorator('registryValue', {
              rules: [{ required: true, message: 'Please provide your registry' }]
            })(
              <Input placeholder="Provide registry" />
            )}
          </Form.Item>
        </React.Fragment>}
      </Form>
    </Modal>
  )
}

const WrappedDockerRegistryModal = Form.create({})(DockerRegistryModal)

const DockerRegistry = ({ dockerRegistry, handleSubmit }) => {

  const [modalVisible, setModalVisible] = useState(false)
  const handleClick = () => setModalVisible(true)
  const handleCancel = () => setModalVisible(false)

  return (
    <div>
      <h2>Docker Registry</h2>
      <p>The docker registry to store images of your services</p>
      {!dockerRegistry && <Button type="ghost" onClick={handleClick}>
        Add Docker Registry
      </Button>}
      {dockerRegistry && <React.Fragment>
        <Input value={dockerRegistry} disabled />
        <Button onClick={handleClick} style={{ marginTop: 16 }}>
          Change Registry
      </Button>
      </React.Fragment>}
      {modalVisible && <WrappedDockerRegistryModal
        handleSubmit={handleSubmit}
        handleCancel={handleCancel} />}
    </div>
  )
}

export default DockerRegistry;