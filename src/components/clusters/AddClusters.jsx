import React, { useState } from "react"
import { Modal, Form, Input, Select } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"


const AddClusters = (props) => {
    const { getFieldDecorator } = props.form;
    const { Option } = Select;

    const handleSubmitClick = e => {
        e.preventDefault();
        props.form.validateFields((err, values) => {
            if (!err) {
                props.handleSubmit(
                    values.name
                )
            }
        })
    }

    return (
        <Modal
            title="Add Cluster"
            visible={true}
            okText="Add"
            onCancel={props.handleCancel}
            onOk={handleSubmitClick}
        >
            <Form layout="vertical">
                <FormItemLabel name="Select a cluster to add to project" />
                <Form.Item>
                    {getFieldDecorator("name", {
                        rules: [
                            {
                                required: true,
                                message: "Please select a cluster"
                            }
                        ]
                    })(
                        <Select placeholder="Select a cluster">
                            {props.clusters.map((data) => (
                                <Option value={data.id}>{data.id}</Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default Form.create({})(AddClusters);
