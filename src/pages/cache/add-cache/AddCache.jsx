import React from "react";
import { Form, Input, Card, Col, Alert, Button } from "antd"
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout"
import { projectModules } from "../../../constants";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";

const AddCache = () => {

    const [form] = Form.useForm();

    const handleFinish = (values) => {
        console.log(values)
    }

    const alertMsg = <div>
        Space Cloud has a Redis add-on that you can use here. You can configure it from the <a href="/mission-control/projects/mockproject1/settings/cluster" style={{ color: '#7EC6FF' }}>cluster settings</a>.
  </div>

    return (
        <React.Fragment>
            <Topbar showProjectSelector />
            <Sidenav selectedItem={projectModules.CACHE} />
            <ProjectPageLayout>
                <InnerTopBar title="Configure cache" />
                <Content>
                    <Col offset={6} style={{ marginTop: "2%" }}>
                        <Card className="Card-align" style={{ width: 706 }}>
                            <Form layout='vertical' form={form} onFinish={handleFinish}>
                                <FormItemLabel name="Redis connection string" />
                                <Form.Item name="conn">
                                    <Input placeholder="Provide connection string of Redis" />
                                </Form.Item>
                                <Alert
                                    message={alertMsg}
                                    type="info"
                                    showIcon
                                />
                                <Button block type="primary" htmlType="submit" style={{ marginTop: 48 }}>Save</Button>
                            </Form>
                        </Card>
                    </Col>
                </Content>
            </ProjectPageLayout>
        </React.Fragment>
    )
}

export default AddCache