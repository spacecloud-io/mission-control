import React, { useState } from "react"
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal, Input, Select } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const RegisterCluster = (props) => {
    const { getFieldDecorator } = props.form;
    const handleSubmitClick = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                props.handleSubmit(
                    values.name,
                    values.username,
                    values.key,
                    values.url
                )
            }
        })
    }
    return (
        <Modal
            title="Register Cluster"
            visible={true}
            okText="Add"
            onCancel={props.handleCancel}
            onOk={handleSubmitClick}
        >
            <Form layout="vertical">
                <FormItemLabel name="Cluster Name" />
                <Form.Item>
                    {getFieldDecorator("name", {
                        rules: [
                            {
                                required: true,
                                message: "Name is required"
                            }
                        ]
                    })(
                        <Input
                            placeholder="Give a suitable name to your cluster (eg: us-east-1)"
                        />
                    )}
                </Form.Item>
                <FormItemLabel name="Username" />
                <Form.Item>
                    {getFieldDecorator("username", {
                        rules: [
                            {
                                required: true,
                                message: "Username is required"
                            }
                        ]
                    })(
                        <Input
                            placeholder="Username of your cluster admin"
                        />
                    )}
                </Form.Item>
                <FormItemLabel name="Access Key" />
                <Form.Item>
                    {getFieldDecorator("key", {
                        rules: [
                            {
                                required: true,
                                message: "Access key is required"
                            }
                        ]
                    })(
                        <Input.Password
                            placeholder="Access Key of your cluster admin"
                        />
                    )}
                </Form.Item>
                <FormItemLabel name="Cluster Url" />
                <Form.Item>
                    {getFieldDecorator("url", {
                        rules: [
                            {
                                required: true,
                                message: "Url is required"
                            }
                        ]
                    })(
                        <Input
                            placeholder="URL of your cluster"
                        />
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default Form.create({})(RegisterCluster);