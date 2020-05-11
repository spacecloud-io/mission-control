import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import ReactGA from 'react-ga';
import { useSelector, useDispatch } from 'react-redux';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import { LeftOutlined } from '@ant-design/icons';
import { set, increment, decrement } from "automate-redux";
import { getProjectConfig, notify, setProjectConfig } from '../../utils';
import { useHistory } from "react-router-dom";
import { Button, Card, Input, Radio, Form, Alert, Cascader } from "antd"
import client from "../../client"
import RadioCards from "../../components/radio-cards/RadioCards"
import FormItemLabel from "../../components/form-item-label/FormItemLabel"
import ConditionalFormBlock from "../../components/conditional-form-block/ConditionalFormBlock";
import "./FileStorageConfig.css"

const FileStorageConfig = (props) => {
    const [form] = Form.useForm();
    const history = useHistory();
    // Router params
    const { projectID } = useParams()

    const dispatch = useDispatch()

    // Global state
    const projects = useSelector(state => state.projects)

    // Secrets
    const FileSecrets = []
    const getDataKeys = (fileSecret) => {
        const fileChildren = []
        Object.keys(fileSecret.data)
            .map(keys => fileChildren.push({ "value": keys, "label": keys }))
        return fileChildren;
    }
    ((getProjectConfig(projects, projectID, "modules.secrets", []))
        .filter(secret => secret.type === 'file'))
        .map(fileSecret => {
            FileSecrets.push({ "value": fileSecret.id, "label": fileSecret.id, "children": getDataKeys(fileSecret) })
        });


    // Component state
    let [selectedRuleName, setSelectedRuleName] = useState("")

    useEffect(() => {
        ReactGA.pageview("/projects/file-storage");
    }, [])

    // Derived properties
    const { rules = [], ...config } = getProjectConfig(projects, projectID, "modules.fileStore", {})
    const noOfRules = rules.length;

    useEffect(() => {
        if (!selectedRuleName && noOfRules > 0) {
            setSelectedRuleName(rules[0].id)
        }
    }, [selectedRuleName, noOfRules])

    // Handlers
    const handleSubmit = (config) => {
        dispatch(increment("pendingRequests"))
        const newConfig = { enabled: true, ...config }
        client.fileStore.setConfig(projectID, newConfig).then(() => {
            const curentConfig = getProjectConfig(projects, projectID, "modules.fileStore", {})
            setProjectConfig(projectID, "modules.fileStore", Object.assign({}, curentConfig, newConfig))
            dispatch(set(`extraConfig.${projectID}.fileStore.connected`, true))
            notify("success", "Success", "Configured file storage successfully")
        })
            .catch(ex => notify("error", "Error", ex))
            .finally(() => dispatch(decrement("pendingRequests")))
    }

    const handleFinish = () => {
        form.validateFields().then(values => {
            delete values["aws-credentials"]
            delete values["gcp-credentials"]
            console.log(values);
            handleSubmit(values);
            form.resetFields();
            history.goBack();
        })
    }

    const fetchConnState = () => {
        dispatch(increment("pendingRequests"))
        client.fileStore.getConnectionState(projectID).then(connected => {
            dispatch(set(`extraConfig.${projectID}.fileStore.connected`, connected))
        })
            .catch(ex => notify("error", "Error fetching connection status", ex))
            .finally(() => dispatch(decrement("pendingRequests")))
    }

    useEffect(() => {
        fetchConnState()
    }, [])

    const { storeType, bucket, endpoint, conn } = props.initialValues ? props.initialValues : {}
    return (
        <div className="file-storage">
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="file-storage" />
                <div className="page-content page-content--no-padding">
                    <div
                        style={{
                            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                            height: 48,
                            lineHeight: 48,
                            zIndex: 98,
                            display: "flex",
                            alignItems: "center",
                            padding: "0 16px"
                        }}
                    >
                        <Button type="link" onClick={() => history.goBack()}>
                            <LeftOutlined />
                            Go back
                        </Button>
                        <span style={{ marginLeft: "35%" }}>Configure file storage</span>
                    </div>
                    <br />
                    <Card className="Card-align">
                        <Form layout="vertical" form={form}
                            initialValues={{ 'storeType': storeType ? storeType : "local", 'conn': conn, 'bucket': bucket, "endpoint": endpoint, "aws-credentials": "space-secrets", "gcp-credentials": "space-secrets" }}
                            onFinish={handleFinish}>
                            <FormItemLabel name="Choose storage backend" {...console.log(FileSecrets)} />
                            <Form.Item name="storeType" rules={[{ required: true, message: 'Please select a storage backend!' }]}>
                                <RadioCards>
                                    <Radio.Button value="local">Local File Store</Radio.Button>
                                    <Radio.Button value="amazon-s3">Amazon S3</Radio.Button>
                                    <Radio.Button value="gcp-storage">Google Cloud Storage</Radio.Button>
                                </RadioCards>
                            </Form.Item>
                            <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "local"}>
                                <FormItemLabel name="Directory path" />
                                <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a directory path!' }]}>
                                    <Input placeholder="Example: /home/user/my-folder" />
                                </Form.Item>
                            </ConditionalFormBlock>
                            <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "amazon-s3"}>
                                <FormItemLabel name="Bucket" />
                                <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
                                    <Input placeholder="Example: my-bucket" />
                                </Form.Item>
                                <FormItemLabel name="Region" />
                                <Form.Item name="conn" rules={[{ required: true, message: 'Please provide a region!' }]} shouldUpdate>
                                    <Input placeholder="Example: us-east-1" />
                                </Form.Item>
                                <FormItemLabel name="Endpoint" description="Optional" />
                                <Form.Item name="endpoint">
                                    <Input placeholder="Example: https://nyc3.digitaloceanspaces.com" />
                                </Form.Item>
                                <FormItemLabel name="Credentials File" description="Credentials file is used to authorize Space Cloud to your bucket" />
                                <Form.Item name="aws-credentials">
                                    <Radio.Group>
                                        <Radio className="radio-align" value="space-secrets">Load from Space Cloud Secrets <span style={{ fontWeight: 'bold' }}>(recommended method)</span></Radio>
                                        <Radio className="radio-align" value="direct-load">Load Directly</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <ConditionalFormBlock dependency="aws-credentials" condition={() => form.getFieldValue("aws-credentials") === "space-secrets"}>
                                    <Alert
                                        message="Prerequisite"
                                        description="Make sure that you have stored the credentials file in a Space Cloud Secret and specified that secret below before saving this configuration. Space Cloud will pull the credentials file from the specified secret."
                                        type="info"
                                        showIcon
                                    />
                                    <p style={{ fontSize: "16px", marginTop: "21px", fontWeight: "bold" }}> Choose a secret </p>
                                    <Form.Item name="secrets">
                                        <Cascader options={FileSecrets} style={{ width: "300px" }} placeholder="Please select" />
                                    </Form.Item>
                                </ConditionalFormBlock>
                                <ConditionalFormBlock dependency="aws-credentials" condition={() => form.getFieldValue("aws-credentials") === "direct-load"}>
                                    <Alert
                                        message="Prerequisite"
                                        description="Make sure that you have stored the credentials file at /root/.aws/credentials of Space Cloud Gateway before saving this configuration. Space Cloud will drectly load the credentals from there."
                                        type="info"
                                        showIcon
                                    />
                                </ConditionalFormBlock>
                            </ConditionalFormBlock>
                            <ConditionalFormBlock dependency="storeType" condition={() => form.getFieldValue("storeType") === "gcp-storage"}>
                                <FormItemLabel name="Bucket" />
                                <Form.Item name="bucket" rules={[{ required: true, message: 'Please provide a bucket!' }]}>
                                    <Input placeholder="Example: my-bucket" />
                                </Form.Item>
                                <FormItemLabel name="Credentials File" description="Credentials file is used to authorize Space Cloud to your bucket" />
                                <Form.Item name="gcp-credentials">
                                    <Radio.Group defaultValue="space-secrets">
                                        <Radio className="radio-align" value="space-secrets">Load from Space Cloud Secrets <span style={{ fontWeight: 'bold' }}>(recommended method)</span></Radio>
                                        <Radio className="radio-align" value="direct-load">Load Directly</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                <ConditionalFormBlock dependency="gcp-credentials" condition={() => form.getFieldValue("gcp-credentials") === "space-secrets"}>
                                    <Alert
                                        message="Prerequisite"
                                        description="Make sure that you have stored the credentials file in a Space Cloud Secret and specified that secret below before saving this configuration. Space Cloud will pull the credentials file from the specified secret."
                                        type="info"
                                        showIcon
                                    />
                                    <p style={{ fontSize: "16px", marginTop: "21px", fontWeight: "bold" }}> Choose a secret </p>
                                    <Form.Item name="secrets">
                                        <Cascader options={FileSecrets} style={{ width: "300px" }} placeholder="Please select" />
                                    </Form.Item>
                                </ConditionalFormBlock>
                                <ConditionalFormBlock dependency="gcp-credentials" condition={() => form.getFieldValue("gcp-credentials") === "direct-load"}>
                                    <Alert
                                        message="Prerequisite"
                                        description="Make sure that you have stored the credentials file in a path accessible to the Space Cloud Gateway and started the Gateway with the GOOGLE_APPLICATION_CREDENTIALS environment (pointing to the credentials file path) before saving this configuration. Space Cloud will load the credentials from the path specified in this environment variable"
                                        type="info"
                                        showIcon
                                    />
                                </ConditionalFormBlock>
                            </ConditionalFormBlock>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="submit">
                                    Save
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>,
                </div>
            </div>
        </div >
    )
}

export default FileStorageConfig;