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

const ConfigureRedis = () => {
    const [form] = Form.useForm();
    const history = useHistory();

    const config = useSelector(state => state.addonsConfig.redis)

    const initialValues = config && config.enabled && {
        cpu: config.resources.cpu / 100,
        memory: config.resources.memory
    }

    const handleFinish = (values) => {
        const config = {
            enabled: true,
            resources: {
                cpu: Number(values.cpu) * 100,
                memory: Number(values.memory)
            }
        }
        incrementPendingRequests()
        saveAddonConfig("redis", config)
        .then(() => notify("success", "Success", "Redis addon configured successfully"))
        .catch(ex => notify("error", "Error", ex))
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
                    <Col offset={6} style={{ marginTop: "2%" }}>
                        <Card className="Card-align" style={{ width: 706 }}>
                            <Form layout="vertical" form={form} initialValues={initialValues} onFinish={handleFinish}>
                                <FormItemLabel name="Resources" />
                                <Input.Group compact>
                                    <Form.Item name="cpu" rules={[{
                                        validator: (_, value, cb) => {
                                            if (Number(value) < 0 || Number(value) > 1) {
                                                cb(`CPU should be in the range of 0 and 1!`)
                                                return
                                            }
                                            if (isNaN(value)) {
                                                cb("Value should be number")
                                            }
                                            cb()
                                        }
                                    }]}>
                                        <Input addonBefore="vCPUs" style={{ width: 160 }} />
                                    </Form.Item>
                                    <Form.Item name="memory" rules={[{
                                        validator: (_, value, cb) => {
                                            if (isNaN(value)) {
                                                cb("Value should be number")
                                            }
                                            cb()
                                        }
                                    }]}>
                                        <Input addonBefore="Memory (in MBs)" style={{ width: 240, marginLeft: 32 }} />
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