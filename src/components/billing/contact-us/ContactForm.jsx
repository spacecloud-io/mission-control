import React from 'react';
import { Row, Col, Card, Form, Input, Button } from 'antd';

const ContactForm = (props) => {

  const { getFieldDecorator } = props.form;
  const handleSendMessage = (event) => {
    event.preventDefault()
    props.form.validateFields((err, values) => {
      if (!err) {
        const { email, subject, message } = values
        props.handleSendMessage(email, subject, message)
      }
    })
  }

  return (
    <Row>
      <Col xl={{ span: 10, offset: 7 }} lg={{ span: 18, offset: 3 }}>
        <Card style={{ borderRadius: '10px', padding: '24px' }}>
          <Form>
            <p style={{ marginBottom: 0 }}><b>Your Email ID</b></p>
            <p style={{ marginTop: 0, fontSize: '14px', fontWeight: 300 }}>We will use this email address to get back to you and nothing else</p>
            <Form.Item>
              {getFieldDecorator('email', {
                initialValue: props.email,
                rules: [{ required: true, message: 'Please input email' }],
              })(
                <Input placeholder="Email" />
              )}
            </Form.Item>
            <p><b>Subject</b></p>
            <Form.Item>
              {getFieldDecorator('subject', {
                initialValue: props.subject,
                rules: [{ required: true, message: 'Please provide a subject' }]
              })(
                <Input className="input" placeholder="What is this about?" />
              )}
            </Form.Item>
            <p><b>Message</b></p>
            <Form.Item>
              {getFieldDecorator('message', {
                rules: [{ required: true, message: 'Please provide a message' }]
              })(
                <Input.TextArea rows={4} placeholder="" />
              )}
            </Form.Item>
            <Button type="primary" style={{ width: '100%', marginTop: '24px' }} onClick={handleSendMessage}>Send message</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

const WrappedContactForm = Form.create({})(ContactForm);

export default WrappedContactForm;