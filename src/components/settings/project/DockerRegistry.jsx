import React, { useState } from 'react'
import { Input, Button, Modal, Select, Radio, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";
import RadioCards from "../../radio-cards/RadioCards";
import ConditionalFormBlock from "../../conditional-form-block/ConditionalFormBlock";

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

const DockerRegistryModal = ({ handleSubmit, handleCancel }) => {

  const [form] = Form.useForm()

  const handleSubmitClick = e => {
    form.validateFields().then(values => {
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
    })
  };

  return (
    <Modal
      title="Configure Docker Registry"
      okText="Save"
      visible={true}
      onOk={handleSubmitClick}
      onCancel={handleCancel}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{ 'registryType': 'gcr' }}>
        <FormItemLabel name="Choose Registry Service" />
        <Form.Item name="registryType" rules={[{ required: true, message: 'Please select a registry service!' }]}>
          <RadioCards>
            <Radio.Button value="gcr">Google GCR</Radio.Button>
            <Radio.Button value="ecr">AWS ECR</Radio.Button>
            <Radio.Button value="acr">Azure ACR</Radio.Button>
            <Radio.Button value="others">Others</Radio.Button>
          </RadioCards>
        </Form.Item>
        <ConditionalFormBlock dependency="registryType" condition={() => form.getFieldValue("registryType") === "gcr"}>
          <FormItemLabel name="GCP Region" />
          <Form.Item name="gcrRegion" rules={[{ required: true, message: 'Please provide a region!' }]}>
            <Select placeholder="Select a region" >
              {gcrRegionOptions}
            </Select>
          </Form.Item>
          <FormItemLabel name="GCP Project" />
          <Form.Item name="gcrProject" rules={[{ required: true, message: 'Please provide project id of your gcp project!' }]}>
            <Input placeholder="Example: my-project-123456" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="registryType" condition={() => form.getFieldValue("registryType") === "ecr"}>
          <FormItemLabel name="AWS Region" />
          <Form.Item name="ecrRegion" rules={[{ required: true, message: 'Please provide a region!' }]}>
            <Select placeholder="Select a region" >
              {ecrRegionOptions}
            </Select>
          </Form.Item>
          <FormItemLabel name="AWS Account ID" />
          <Form.Item name="awsAccountId" rules={[{ required: true, message: 'Please provide your aws account id' }]}>
            <Input placeholder="Example: 563789405948" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="registryType" condition={() => form.getFieldValue("registryType") === "acr"}>
          <FormItemLabel name="ACR Registry name" />
          <Form.Item name="acrRegistryName" rules={[{ required: true, message: 'Please provide your registry name' }]}>
            <Input placeholder="Example: mycontainerregistry007" />
          </Form.Item>
        </ConditionalFormBlock>
        <ConditionalFormBlock dependency="registryType" condition={() => form.getFieldValue("registryType") === "others"}>
          <FormItemLabel name="Docker Registry" />
          <Form.Item name="registryValue" rules={[{ required: true, message: 'Please provide your registry' }]}>
            <Input placeholder="Provide registry" />
          </Form.Item>
        </ConditionalFormBlock>
      </Form>
    </Modal>
  )
}

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
      {modalVisible && <DockerRegistryModal
        handleSubmit={handleSubmit}
        handleCancel={handleCancel} />}
    </div>
  )
}

export default DockerRegistry;