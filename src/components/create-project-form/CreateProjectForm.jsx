import React from "react"
import { Form, Input, Button } from "antd"
import { EditOutlined } from '@ant-design/icons';

export default function CreateProjectForm({ projects = [], handleSubmit }) {
  const [form] = Form.useForm()
  const [projectName, setProjectName] = React.useState("")
  const projectId = projectName.toLowerCase()
  const handleValuesChange = (({ projectName }) => setProjectName(projectName))
  const handleFormFinish = (values) => handleSubmit(values.projectName, projectId)
  return (
    <Form form={form} onFinish={handleFormFinish} onValuesChange={handleValuesChange}>
      <p style={{ fontWeight: "bold" }}><b>Name your project</b></p>
      <Form.Item
        name="projectName"
        rules={[
          {
            validator: (_, value, cb) => {
              if (!value) {
                cb("Please input a project name")
                return
              }
              if (!(/^[0-9a-zA-Z]+$/.test(value))) {
                cb("Project name can only contain alphanumeric characters!")
                return
              }
              if (projects.some(project => project === value.toLowerCase())) {
                cb("Project name already taken. Please provide a unique project name!")
                return
              }
              cb()
            }
          }]}>
        <Input placeholder="Project name" prefix={<EditOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
      </Form.Item>
      {projectId && <span className="hint">ProjectID: {projectId}</span>}
      <Form.Item>
        <Button type="primary" htmlType="submit" className="project-btn">Create project</Button>
      </Form.Item>
    </Form>
  )
}