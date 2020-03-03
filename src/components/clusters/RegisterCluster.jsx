import React, { useState } from "react"
import { Modal, Form, Input, Select } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const RegisterCluster = (props) => {
    const { getFieldDecorator } = props.form;
    return (
        <Modal
            title="Register Cluster"
            visible={true}
            okText="Add"
            onCancel={props.handleCancel}
        //onOk={handleSubmit}
        >
            <Form layout="vertical">
                <FormItemLabel name="Cluster Name" />
                <Form.Item>
                    {getFieldDecorator("Cluster Name", {
                        rules: [
                            {
                                required: true,
                                message: "Please give suitable name"
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
                                message: "Please give suitable username"
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
                    {getFieldDecorator("Key", {
                        rules: [
                            {
                                required: true,
                                message: "Please provide Access key"
                            }
                        ]
                    })(
                        <Input
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
                                message: "Please give cluster url"
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