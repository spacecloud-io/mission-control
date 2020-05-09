import React from 'react';
import { Modal, Input, Form } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel"

const ContactUs = (props) => {
    const { getFieldDecorator } = props.form;
    const [form] = Form.useForm();
    const defaultSubject = props.initialvalues

    const handleSubmitClick = e => {
        form.validateFields().then(values => {
            try {
                props.handleContactUs(values.subject, values.message);
            } catch (ex) {
                console.log(ex)
            }
        });
    };

    return (
        <Modal
            title="Contact us"
            okText="Submit"
            visible={true}
            onOk={handleSubmitClick}
            onCancel={props.handleCancel}
        >
            <Form layout="vertical" form={form} initialValues={{ vertical: defaultSubject }}>
                <FormItemLabel name="Subject" />
                <Form.Item name="subject" rules={[{ required: true, message: 'Please provide a subject' }]}>
                        <Input className="input" placeholder="What is this about?" />
                </Form.Item>
                <FormItemLabel name="Message" />
                <Form.Item name="message" rules={[{ required: true, message: 'Please provide a message' }]}>
                        <Input.TextArea rows={4} placeholder="" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ContactUs