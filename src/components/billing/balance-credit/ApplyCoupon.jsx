import React from 'react';
import { Modal, Form, Input } from 'antd';

const ContactUs = (props) => {
    const { getFieldDecorator } = props.form;

    return(
    <Modal
    title="Apply coupon"
    okText="Apply"
    visible={true}
    onOk={props.handleSubmitClick}
    onCancel={props.handleCancel}
    >
        <Form>
            <p style={{ marginBottom: 0 }}><b>Coupon code</b> (Optional)</p>
            <p style={{ marginTop: 0, fontSize: '14px', fontWeight: 300 }}>Apply a coupon code to get free credits to your account immediately</p>
            <Form.Item>
                {getFieldDecorator('coupon-code', {
                    rules: [{ required: true, message: 'Please provide a coupon code' }],
                })(
                    <Input className="input" placeholder="Coupon code" />
                )}
            </Form.Item>
        </Form>
    </Modal>
    );
}

const WrappedContactForm = Form.create({})(ContactUs);

export default WrappedContactForm