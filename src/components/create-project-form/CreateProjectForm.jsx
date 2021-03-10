import React from "react"
import { Form, Input, Button, Radio } from "antd"
import FormItemLabel from "../form-item-label/FormItemLabel";
import RadioCards from "../radio-cards/RadioCards";
import aws from '../../assets/aws.svg'
import gcp from '../../assets/gcp.svg'
import azure from "../../assets/azure.svg"

export default function CreateProjectForm({ projects = [], handleSubmit }) {
  const [form] = Form.useForm()
  const handleFormFinish = (values) => handleSubmit(values.projectName, values.projectName.toLowerCase())
  return (
    <Form form={form} onFinish={handleFormFinish}>
      <FormItemLabel name="Name your project" />
      <Form.Item
        name="projectName"
        rules={[
          {
            validator: (_, value) => {
              if (!value) {
                return Promise.reject("Please input a project name")
              }
              if (!(/^[0-9a-zA-Z]+$/.test(value))) {
                return Promise.reject("Project name can only contain alphanumeric characters!")
              }
              if (projects.some(project => project === value.toLowerCase())) {
                return Promise.reject("Project name already taken. Please provide a unique project name!")
              }
              return Promise.resolve()
            }
          }]}>
        <Input placeholder="eg: MyProject" style={{ maxWidth: 600 }} />
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {() => form.getFieldValue("projectName") && <div style={{ marginBottom: 22 }} className="hint">ProjectID: {form.getFieldValue("projectName").toLowerCase()}</div>}
      </Form.Item>
      <FormItemLabel name="Where do you want to deploy/host it" />
      <Form.Item name="platform" rules={[{ required: true, message: "Please select a platform!" }]}>
        <RadioCards size="large">
          <Radio.Button value="aws" size="large">
            <img src={aws} alt="aws" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>AWS</span>
          </Radio.Button>
          <Radio.Button value="gcp">
            <img src={gcp} alt="gcp" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>Google Cloud</span>
          </Radio.Button>
          <Radio.Button value="azure">
            <img src={azure} alt="azure" width="24px" height="24px" style={{ marginRight: 4 }} />
            <span>MS Azure</span>
          </Radio.Button>
        </RadioCards>
      </Form.Item>
      <Button type="primary" size="large" style={{ float: "right" }} htmlType="submit">Next</Button>
    </Form>
  )
}