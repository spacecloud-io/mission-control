import React from 'react';
import { Row, Col, Card, Form, Input, Button } from 'antd';
import './register-cluster.css';

const SubscriptionDetail = (props) => {

    const { getFieldDecorator } = props.form;
    
    return(
        <Row>
            <Col xl={{ span: 10, offset:7 }} lg={{ span: 18, offset: 3}}>
                <Card style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px', padding:'24px'}}>
                    <p><b>Subscription details</b></p>
                    <Card title={<p style={{ fontSize:"18px" }}>Pro plan</p>} extra={<p style={{ fontSize:"18px" }}><span style={{ color:"#34A853" }}>$25</span> per month</p>}>
                        <p><b>Total Projects</b>: 1</p>
                        <p><b>Total Databases</b>: 3 per project</p>
                    </Card>
                    <Form>
                        <p style={{ marginBottom:0, marginTop:'32px' }}><b>Coupon code</b> (Optional)</p>
                        <p style={{ marginTop:0, fontSize: '14px', fontWeight: 300 }}>Apply a coupon code to get free credits to your  account</p>
                        <Form.Item>
                            {getFieldDecorator('coupon-code', {
                                rules: [{ required: true, message: 'Please input coupon code' }],
                            })(
                                <Row>
                                    <Col xs={{ span:18 }}>
                                        <Input placeholder="e.g. Testing Cluster" />
                                    </Col>
                                    <Col xs={{ span:5, offset:1 }}>
                                        <Button type="primary" ghost>Apply</Button>
                                    </Col>
                                </Row>
                            )}
                        </Form.Item>
                        <Button type="primary" style={{ width:'100%', marginTop:'24px' }} onClick={props.handleRegisterCluster}>Start subscription</Button>
                    </Form> 
                </Card>
            </Col>
        </Row>
    );
}

const WrappedSubscriptionDetail = Form.create({})(SubscriptionDetail);

export default WrappedSubscriptionDetail;