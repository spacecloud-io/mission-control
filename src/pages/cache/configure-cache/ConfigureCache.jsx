import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, Input, Card, Col, Alert, Button } from "antd"
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout"
import { projectModules } from "../../../constants";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { decrementPendingRequests, incrementPendingRequests, notify } from "../../../utils";
import { saveCacheConfig } from "../../../operations/cache";

const ConfigureCache = () => {

  const { projectID } = useParams()
  const history = useHistory()
  const [form] = Form.useForm();

  const config = useSelector(state => state.cacheConfig)

  const handleFinish = (values) => {
    const config = { enabled: true, ...values }
    incrementPendingRequests()
    saveCacheConfig(projectID, config)
      .then(() => notify("success", "Success", "Configured cache successfully"))
      .catch(ex => notify("error", "Error configuring cache", ex))
      .finally(() => {
        decrementPendingRequests()
        history.goBack()
      })
  }

  const formInitialValues = {
    conn: config && config.enabled ? config.conn : "redis.space-cloud.svc.cluster.local:6379"
  }

  // This is used to bind the form initial values on page reload. 
  // On page reload the redux is intially empty leading the form initial values to be empty. 
  // Hence as soon as redux gets the desired value, we set the form values    
  useEffect(() => {
    if (formInitialValues.conn) {
      form.setFieldsValue(formInitialValues)
    }
  }, [formInitialValues.conn])


  const alertMsg = <div>
    Space Cloud has a Redis add-on that you can use here. You can configure it from the <a href={`/mission-control/projects/${projectID}/settings/add-ons`} style={{ color: '#7EC6FF' }}>add-ons page</a>.
  </div>

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.CACHE} />
      <ProjectPageLayout>
        <InnerTopBar title="Configure cache" />
        <Content>
          <Col sm={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 14, offset: 5 }}>
            <Card>
              <Form layout='vertical' initialValues={formInitialValues} form={form} onFinish={handleFinish}>
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

export default ConfigureCache