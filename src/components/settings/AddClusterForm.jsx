import React from "react"

import { Modal, Form, Input } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"

const AddClusterForm = (props) => {
    const { getFieldDecorator, getFieldValue } = props.form;

    const handleSubmitClick = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                console.log("submit")
            }
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
            <Form layout="vertical" onSubmit={handleSubmitClick}>
                <FormItemLabel name="Username" />
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: 'Please provide a username' }],
                        initialValue: ""
                    })(
                        <Input className="input" placeholder="Username of your cluster admin" />
                    )}
                </Form.Item>
                <FormItemLabel name="Access Key" />
                <Form.Item>
                    {getFieldDecorator('Access Key', {
                        rules: [{ required: true, message: 'Please provide Access Key' }],
                        initialValue: ""
                    })(
                        <Input placeholder="Access Key of your cluster admin" />
                    )}
                </Form.Item>
                <FormItemLabel name="Cluster URL" />
                <Form.Item >
                    {getFieldDecorator('url', {
                        rules: [{ required: true, message: 'Please provide a cluster url' }],
                        initialValue: ""
                    })(
                        <Input placeholder="URL of your cluster" />
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}

const WrappedRuleForm = Form.create({})(AddClusterForm);

export default WrappedRuleForm