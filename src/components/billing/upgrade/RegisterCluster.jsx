import React, {useState} from 'react';
import { Row, Col, Card, Form, Input, Button, Alert, Modal, Icon } from 'antd';
import './register-cluster.css';

const RegisterCluster = (props) => {

    const { getFieldDecorator } = props.form;
    const [modalVisisble, setModalVisible] = useState(false)
    const alertMsg = <div>
         You have already registered a cluster with the Testing Cluster name in the past. <br /><br/>
Continuing with this name for this cluster will cause any previously running cluster with the same name to be switched back to the open source plan.
        </div>

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
                        <Button type="primary" style={{ width:'100%', marginTop:'24px' }} onClick={() => setModalVisible(true)}>Start subscription</Button>
                    </Form> 
                </Card>
                <Modal 
                    visible={modalVisisble} 
                    cancelText="Change name" 
                    okText="Continue with the name"
                    onOk={()=> setModalVisible(false)}
                    onCancel={()=> setModalVisible(false)}
                    className="cluster-name-modal"
                    style={{ padding: "32px 28px 0px 28px" }}>
                        <Icon type="info-circle" style={{fontSize:"24px", color: '#F9AE3A' }} /> 
                        <span style={{ fontSize:'16px', marginLeft:'16px'  }}>Cluster name already in use</span><br />
                        <Alert 
                            message=" " 
                            description={alertMsg} 
                            type="warning" 
                            style={{ marginLeft:'40px', marginTop:'12px'  }} />
                </Modal>
            </Col>
        </Row>
    );
}

const WrappedRegisterCluster = Form.create({})(RegisterCluster);

export default WrappedRegisterCluster;