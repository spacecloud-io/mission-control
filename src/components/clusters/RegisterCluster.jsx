import React, { useState } from "react"
import { Modal, Input, Select, Form } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const RegisterCluster = (props) => {
    const [form] = Form.useForm();
    const handleSubmitClick = e => {
        form.validateFields().then(values => {
            props.handleSubmit(
                values.name,
                values.username,
                values.key,
                values.url
            )
        });
    };

    return (
        <Modal
            title="Register Cluster"
            visible={true}
            okText="Add"
            onCancel={props.handleCancel}
            onOk={handleSubmitClick}
        >
            <Form form={form} layout="vertical">
                <FormItemLabel name="Cluster Name" />
                <Form.Item name="name" rules={[
                            {
                                required: true,
                                message: "Name is required"
                            }
                        ]
                    }>
                        <Input
                            placeholder="Give a suitable name to your cluster (eg: us-east-1)"
                        />
                </Form.Item>
                <FormItemLabel name="Username" />
                <Form.Item name="username" rules={[
                            {
                                required: true,
                                message: "Username is required"
                            }
                        ]
                    }>
                        <Input
                            placeholder="Username of your cluster admin"
                        />
                </Form.Item>
                <FormItemLabel name="Access Key" />
                <Form.Item name="key" rules={[
                            {
                                required: true,
                                message: "Access key is required"
                            }
                        ]}>
                        <Input.Password
                            placeholder="Access Key of your cluster admin"
                        />
                </Form.Item>
                <FormItemLabel name="Cluster Url" />
                <Form.Item name="url" rules={[
                            {
                                required: true,
                                message: "Url is required"
                            }
                        ]
                    }>
                        <Input
                            placeholder="URL of your cluster"
                        />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default RegisterCluster;