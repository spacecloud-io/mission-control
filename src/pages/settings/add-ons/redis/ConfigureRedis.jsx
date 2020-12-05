import React from "react";
import { useHistory } from "react-router-dom";
import { Form, Col, Card, Input, Button } from "antd";
import Sidenav from '../../../../components/sidenav/Sidenav'
import Topbar from '../../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../../components/project-page-layout/ProjectPageLayout";
import { projectModules } from "../../../../constants";
import FormItemLabel from "../../../../components/form-item-label/FormItemLabel"
import { saveAddonConfig } from "../../../../operations/addons";
import { decrementPendingRequests, incrementPendingRequests, notify } from "../../../../utils";
import { useSelector } from "react-redux";

const defaultConfig = {
  resources: {
    cpu: 100,
    memory: 100
  }
}

const ConfigureRedis = () => {
  const [form] = Form.useForm();
  const history = useHistory();

  const config = useSelector(state => state.addonsConfig.redis)
  const initialConfig = config && config.enabled ? config : defaultConfig
  const formInitialValues = {
    cpu: initialConfig.resources.cpu / 1000,
    memory: initialConfig.resources.memory
  }

  const handleFinish = (values) => {
    const config = {
      enabled: true,
      resources: {
        cpu: Number(values.cpu) * 1000,
        memory: Number(values.memory)
      }
    }
    incrementPendingRequests()
    saveAddonConfig("redis", config)
      .then(() => notify("success", "Success", "Configured Redis add-on successfully"))
      .catch(ex => notify("error", "Error configuring Redis add-on", ex))
      .finally(() => {
        history.goBack()
        decrementPendingRequests()
      })
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.SETTINGS} />
      <ProjectPageLayout>
        <InnerTopBar title="Configure Redis" />
        <Content>
          <Col sm={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 14, offset: 5 }}>
            <Card>
              <Form layout="vertical" form={form} initialValues={formInitialValues} onFinish={handleFinish}>
                <FormItemLabel name="Resources" />
                <Input.Group compact>
                  <Form.Item name="cpu" style={{ width: 160 }} rules={[{
                    required: true,
                    validator: (_, value, cb) => {
                      if (!value) {
                        cb(`CPU is required!`)
                        return
                      }
                      if (Number(value) < 0 || Number(value) > 1) {
                        cb(`CPU should be in the range of 0 and 1!`)
                        return
                      }
                      if (isNaN(value)) {
                        cb("Value should be number")
                        return
                      }
                      cb()
                    }
                  }]}
                  >
                    <Input addonBefore="vCPUs" />
                  </Form.Item>
                  <Form.Item name="memory" style={{ width: 240, marginLeft: 32 }} rules={[{
                    required: true,
                    message: "RAM is required!",
                    validator: (_, value, cb) => {
                      if (!value) {
                        cb(`Memory is required!`)
                        return
                      }
                      if (isNaN(value)) {
                        cb("Value should be number")
                        return
                      }
                      cb()
                    }
                  }]}
                  >
                    <Input addonBefore="Memory (in MBs)" />
                  </Form.Item>
                </Input.Group>
                <Button size="large" block htmlType="submit" type="primary">Save</Button>
              </Form>
            </Card>
          </Col>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default ConfigureRedis