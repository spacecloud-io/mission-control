import React from "react";
import { useHistory } from "react-router-dom"
import { useSelector } from "react-redux";
import { Form, Col, Card, Input, Switch, Button } from "antd";
import Sidenav from '../../../../components/sidenav/Sidenav'
import Topbar from '../../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../../components/project-page-layout/ProjectPageLayout";
import { projectModules } from "../../../../constants";
import FormItemLabel from "../../../../components/form-item-label/FormItemLabel"
import { decrementPendingRequests, incrementPendingRequests, notify } from "../../../../utils";
import { saveAddonConfig } from "../../../../operations/addons";

const RabbitMQ = () => {
    const history = useHistory()
    const [form] = Form.useForm();
    const config = useSelector(state => state.addonsConfig.rabbitmq);

    const initialValues = config && config.enabled && {
        cpu : config.resources.cpu / 1000,
        memory: config.resources.memory,
        highAvailability: config.options.highAvailability
    }
    
    const handleFinish = (values) => {
        const config = {
            enabled: true,
            resources: {
                cpu: Number(values.cpu) * 1000,
                memory: Number(values.memory)
            },
            options: {
                highAvailability: values.highAvailability
            }
        }
        incrementPendingRequests()
        saveAddonConfig("rabbitmq", config)
        .then(() => {
            notify("success", "Success", "Configured RabbitMQ add-on successfully")
            history.goBack()
        })
        .catch(ex => notify("error", "Error configuring RabbitMQ add-on", ex))
        .finally(() => decrementPendingRequests())
    }

    return (
        <React.Fragment>
            <Topbar showProjectSelector />
            <Sidenav selectedItem={projectModules.SETTINGS} />
            <ProjectPageLayout>
                <InnerTopBar title="Configure Rabbit MQ" />
                <Content>
                    <Col offset={6} style={{ marginTop: "2%" }}>
                        <Card className="Card-align" style={{ width: 706 }}>
                            <Form layout="vertical" form={form} initialValues={initialValues} onFinish={handleFinish}>
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
                                            }
                                            cb()
                                        }
                                    }]}>
                                        <Input addonBefore="vCPUs" />
                                    </Form.Item>
                                    <Form.Item name="memory" style={{ width: 240, marginLeft: 32 }} rules={[{
                                        required: true,
                                        validator: (_, value, cb) => {
                                            if (!value) {
                                                cb(`CPU is required!`)
                                                return
                                            }
                                            if (isNaN(value)) {
                                                cb(`Memory should be a number!`)
                                                return
                                            }
                                            cb()
                                        }
                                    }]}>
                                        <Input addonBefore="Memory (in MBs)" />
                                    </Form.Item>
                                </Input.Group>
                                <FormItemLabel name="High Availability" />
                                <Form.Item name="highAvailability" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                                <Button size="large" block htmlType="submit" type="primary">Save</Button>
                            </Form>
                        </Card>
                    </Col>
                </Content>
            </ProjectPageLayout>
        </React.Fragment>
    )
}

export default RabbitMQ