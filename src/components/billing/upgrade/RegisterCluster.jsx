import React from 'react';
import { Row, Col, Card, Form, Input, Button } from 'antd';
import './register-cluster.css';

const RegisterCluster = (props) => {

    const { getFieldDecorator } = props.form;
    
    return(
        <Row className="register-cluster">
            <Col xl={{ span: 10, offset:7 }} lg={{ span: 18, offset: 3}}>
                <Card style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px'}}>
                    <Form>
                        <p style={{ marginBottom:0 }}><b>Name this cluster</b></p>
                        <p style={{ marginTop:0, fontSize: '14px', fontWeight: 300 }}>Cluster name is used to identify this cluster uniquely in your invoices</p>
                        <Form.Item>
                            {getFieldDecorator('new-cluster', {
                                rules: [{ required: true, message: 'Please input cluster name' }],
                            })(
                                <Input placeholder="e.g. Testing Cluster" />
                            )}
                        </Form.Item>
                        <Button type="primary" style={{ width:'100%', marginTop:'24px' }} onClick={props.handleRegisterCluster}>Register cluster</Button>
                    </Form> 
                </Card>
            </Col>
        </Row>
    );
}

const WrappedRegisterCluster = Form.create({})(RegisterCluster);

export default WrappedRegisterCluster;