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
    }, [])

    const [form] = Form.useForm();
    const [selectedDb, setSelectedDb] = useState("");
    const [value, setValue] = useState("");
    const dbConfigs = useSelector(state => getDbConfigs(state))
    const trackedCollections = useSelector(state => getTrackedCollections(state, selectedDb))

    const dbList = Object.keys(dbConfigs)

    const handleFinish = (values) => {
        let data = {};
        switch (values) {
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
        .then(() => notify("success", "Success", "Cache purged successfully"))
        .catch(ex => notify("error", "Error", ex))
        .finally(() => decrementPendingRequests())
    }

    const handleSelectDatabase = value => setSelectedDb(value)
    const handleSearch = value => setValue(value);

    return (
        <React.Fragment>
            <Topbar showProjectSelector />
            <Sidenav selectedItem={projectModules.CACHE} />
            <ProjectPageLayout>
                <InnerTopBar title="Purge cache" />
                <Content>
                    <Col offset={6} style={{ marginTop: "2%" }}>
                        <Card className="Card-align" style={{ width: 706 }}>
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
                                        <AutoComplete placeholder="Specify database alias" onChange={handleSelectDatabase} options={dbList.map(db => ({ value: db }))} />
                                    </Form.Item>
                                </ConditionalFormBlock>
                                <ConditionalFormBlock dependency="level" condition={() => form.getFieldValue("level") === "table"}>
                                    <FormItemLabel name="Database" />
                                    <Form.Item name="db" rules={[{ required: true, message: 'Please select a database!' }]}>
                                        <AutoComplete placeholder="Specify database alias" onChange={handleSelectDatabase} options={dbList.map(db => ({ value: db }))} />
                                    </Form.Item>                                  
                                    <FormItemLabel name="Table" />
                                    <Form.Item name="col">
                                        <AutoComplete placeholder="Specify table/collection name" onSearch={handleSearch} >
                                            {
                                                trackedCollections.filter(data => (data.toLowerCase().indexOf(value.toLowerCase()) !== -1)).map(data => (
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