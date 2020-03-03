import React, { useState } from "react"
import { Modal, Form, Input, Select } from 'antd';
import FormItemLabel from "../form-item-label/FormItemLabel"


const AddCluster = (props) => {
    const { getFieldDecorator } = props.form;
    const { Option } = Select;
    return (
        <Modal
            title="Add Cluster"
            visible={true}
            okText="Add"
            onCancel={props.handleCancel}
        //onOk={handleSubmit}
        >
            <Form layout="vertical">
                <FormItemLabel name="Select a cluster to add to project" />
                <Form.Item>
                    {getFieldDecorator("name")(
                        <Select placeholder="select a cluster">
                            {props.data.map((data) => (
                                <Option value={data.id}>{data.id}</Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default Form.create({})(AddCluster);
