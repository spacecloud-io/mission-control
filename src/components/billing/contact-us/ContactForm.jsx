import React from 'react';
import { Row, Col, Card, Form, Input, Button } from 'antd';
import FormItemLabel from "../../form-item-label/FormItemLabel";

const ContactForm = ({ email, subject, handleSendMessage }) => {
  const handleSubmit = ({ email, subject, message }) => handleSendMessage(email, subject, message)
  return (
    <Row>
      <Col xl={{ span: 10, offset: 7 }} lg={{ span: 18, offset: 3 }}>
        <Card style={{ borderRadius: '10px', padding: '24px' }}>
          <Form initialValues={{ email, subject }} onFinish={handleSubmit}>
            <FormItemLabel name="Your Email ID" description="We will use this email address to get back to you and nothing else" />
            <Form.Item name="email" rules={[{ required: true, message: 'Please provide an email' }]}>
              <Input placeholder="Email" />
            </Form.Item>
            <p><b>Subject</b></p>
            <Form.Item name="subject" rules={[{ required: true, message: 'Please provide a subject' }]}>
              <Input placeholder="What is this about?" />
            </Form.Item>
            <FormItemLabel name="Message" />
            <Form.Item name="message" rules={[{ required: true, message: 'Please provide a message' }]}>
              <Input.TextArea rows={4} placeholder="" />
            </Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '24px' }} >Send message</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default ContactForm;