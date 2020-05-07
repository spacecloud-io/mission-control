import React from "react"
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const AddClusterForm = (props) => {
    const [form] = Form.useForm;

    const handleSubmitClick = e => {
        form.validateFields().then(values => {
            console.log("submit")
        });
    };

    return (
        <Modal
            title="Add Cluster"
            okText="Add"
            visible={true}
            onCancel={props.handleCancel}
            onOk={handleSubmitClick}
        >
            <Form layout="vertical" form={form} initialValues={{ username: "", url: "" }} onFinish={handleSubmitClick}>
                <FormItemLabel name="Username" />
                <Form.Item name="username" rules={[{ required: true, message: 'Please provide a username' }]}>
                        <Input className="input" placeholder="Username of your cluster admin" />
                </Form.Item>
                <FormItemLabel name="Access Key" />
                <Form.Item name="Access Key" rules={[{ required: true, message: 'Please provide Access Key' }]}
                initialValue="">
                        <Input placeholder="Access Key of your cluster admin" />
                </Form.Item>
                <FormItemLabel name="Cluster URL" />
                <Form.Item name="url" rules={[{ required: true, message: 'Please provide a cluster url' }]}>
                        <Input placeholder="URL of your cluster" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AddClusterForm