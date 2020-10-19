import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, Radio, Col, Card, Alert, Button, AutoComplete } from "antd";
import { useSelector } from "react-redux";
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import ProjectPageLayout, { Content, InnerTopBar } from "../../../components/project-page-layout/ProjectPageLayout"
import { projectModules } from "../../../constants";
import RadioCards from "../../../components/radio-cards/RadioCards"
import FormItemLabel from "../../../components/form-item-label/FormItemLabel"
import ConditionalFormBlock from "../../../components/conditional-form-block/ConditionalFormBlock";
import { getDbConfigs, loadDbConfig, getTrackedCollections, loadDbRules, loadDbSchemas } from "../../../operations/database";
import { notify, decrementPendingRequests, incrementPendingRequests } from "../../../utils";
import { purgeCache } from "../../../operations/cache";

const PurgeCache = () => {

  const { projectID } = useParams();

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadDbConfig(projectID)
        .catch(ex => notify("error", "Error fetching database config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbSchemas(projectID)
        .catch(ex => notify("error", "Error fetching database schemas", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbRules(projectID)
        .catch(ex => notify("error", "Error fetching database rules", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  const [form] = Form.useForm();
  const [db, setDb] = useState("");
  const [col, setCol] = useState("");
  const dbConfigs = useSelector(state => getDbConfigs(state))
  const trackedCollections = useSelector(state => getTrackedCollections(state, db))

  const dbList = Object.keys(dbConfigs)

  const handleFinish = (values) => {
    let data = {};
    switch (values.level) {
      case "all":
        data = values;
        break;
      case "database":
        data = {
          level: "database",
          options: {
            db: values.db,
            col: "*"
          }
        }
        break;
      case "table":
        data = {
          level: "database",
          options: {
            db: values.db,
            col: values.col
          }
        }
        break;
      default:
        break;
    }
    incrementPendingRequests()
    purgeCache(projectID, data)
      .then(() => notify("success", "Success", "Purged cache successfully"))
      .catch(ex => notify("error", "Error purging cache", ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.CACHE} />
      <ProjectPageLayout>
        <InnerTopBar title="Purge cache" />
        <Content>
          <Col sm={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }} xl={{ span: 14, offset: 5 }}>
            <Card>
              <Form layout="vertical" form={form} initialValues={{ level: "all" }} onFinish={handleFinish}>
                <FormItemLabel name="Purge level" />
                <Form.Item name="level" rules={[{ required: true, message: 'Please select a level!' }]}>
                  <RadioCards>
                    <Radio.Button value="all">All</Radio.Button>
                    <Radio.Button value="database">Database</Radio.Button>
                    <Radio.Button value="table">Table</Radio.Button>
                  </RadioCards>
                </Form.Item>
                <ConditionalFormBlock dependency="level" condition={() => form.getFieldValue("level") === "all"}>
                  <Alert
                    message="Warning"
                    description="This will purge all the cache stored in Redis"
                    type="warning"
                    showIcon
                  />
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="level" condition={() => form.getFieldValue("level") === "database"}>
                  <FormItemLabel name="Database" />
                  <Form.Item name="db" rules={[{ required: true, message: 'Please select a database!' }]}>
                    <AutoComplete placeholder="Specify table/collection name" onSearch={(value) => setDb(value)} onSelect={(value) => setDb(value)}>
                      {
                        dbList.filter(data => (data.toLowerCase().indexOf(db.toLowerCase()) !== -1)).map(data => (
                          <AutoComplete.Option key={data} value={data}>
                            {data}
                          </AutoComplete.Option>
                        ))
                      }
                    </AutoComplete>
                  </Form.Item>
                </ConditionalFormBlock>
                <ConditionalFormBlock dependency="level" condition={() => form.getFieldValue("level") === "table"}>
                  <FormItemLabel name="Database" />
                  <Form.Item name="db" rules={[{ required: true, message: 'Please select a database!' }]}>
                    <AutoComplete placeholder="Specify database" onSearch={(value) => setDb(value)} onSelect={(value) => setDb(value)}>
                      {
                        dbList.filter(data => (data.toLowerCase().indexOf(db.toLowerCase()) !== -1)).map(data => (
                          <AutoComplete.Option key={data} value={data}>
                            {data}
                          </AutoComplete.Option>
                        ))
                      }
                    </AutoComplete>
                  </Form.Item>
                  <FormItemLabel name="Table/Collection" />
                  <Form.Item name="col">
                    <AutoComplete placeholder="Specify table/collection name" onSearch={(value) => setCol(value)} >
                      {
                        trackedCollections.filter(data => (data.toLowerCase().indexOf(col.toLowerCase()) !== -1)).map(data => (
                          <AutoComplete.Option key={data} value={data}>
                            {data}
                          </AutoComplete.Option>
                        ))
                      }
                    </AutoComplete>
                  </Form.Item>
                </ConditionalFormBlock>
                <Button type="primary" htmlType="submit" block style={{ marginTop: 48, backgroundColor: "#FF4D4F" }}>Purge cache</Button>
              </Form>
            </Card>
          </Col>
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default PurgeCache