import React from "react";
import { Form, Col, Card, Input, Switch, Button } from "antd";
import Sidenav from '../../../../components/sidenav/Sidenav'
import Topbar from '../../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../../components/project-page-layout/ProjectPageLayout";
import { projectModules } from "../../../../constants";
import FormItemLabel from "../../../../components/form-item-label/FormItemLabel"

const RabbitMQ = () => {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        console.log(values)
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
                            <Form layout="vertical" form={form} initialValues={{ level: "all" }} onFinish={handleFinish}>
                                <FormItemLabel name="Resources" />
                                <Input.Group compact>
                                    <Form.Item name="cpu">
                                        <Input addonBefore="vCPUs" style={{ width: 160 }} />
                                    </Form.Item>
                                    <Form.Item name="memory">
                                        <Input addonBefore="Memory (in MBs)" style={{ width: 240, marginLeft: 32 }} />
                                    </Form.Item>
                                </Input.Group>
                                <FormItemLabel name="High Availability" />
                                <Form.Item name="availability" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                                <FormItemLabel name="Storage class" />
                                <Form.Item name="class">
                                    <Input placeholder="Provide a storage class" />
                                </Form.Item>
                                <FormItemLabel name="Storage size" /> 
                                <Form.Item name="size">
                                    <Input addonBefore="Storage (in GBs)" style={{ width: 240 }} min={1} />
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