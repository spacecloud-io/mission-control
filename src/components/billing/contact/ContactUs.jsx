import React from 'react';
import { Modal, Form, Input } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const ContactUs = (props) => {
    const { getFieldDecorator } = props.form;

    return(
    <Modal
    title="Contact us"
    okText="Submit"
    visible={true}
    >
        <Form layout="vertical">
            <FormItemLabel name="Subject" />
            <Form.Item>
                {getFieldDecorator('subject', {
                    rules: [{ required: true, message: 'Please provide a subject' }]
                })(
                    <Input className="input" placeholder="What is this about?" />
                )}
            </Form.Item>
            <FormItemLabel name="Message" />
            <Form.Item>
                {getFieldDecorator('message', {
                    rules: [{ required: true, message: 'Please provide a message' }]
                })(
                    <Input.TextArea rows={4} placeholder="" />
                )}
            </Form.Item>
        </Form>
    </Modal>
    );
}

const WrappedContactForm = Form.create({})(ContactUs);

export default WrappedContactForm