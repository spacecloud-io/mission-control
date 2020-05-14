import React, { useEffect } from 'react';
import { Row, Col, Card, Form, AutoComplete, Button } from 'antd';
import './register-cluster.css';
import { useDispatch, useSelector } from 'react-redux';
import { increment, decrement } from 'automate-redux';
import { fetchClusters } from '../../../utils';
import FormItemLabel from "../../form-item-label/FormItemLabel";

const RegisterCluster = (props) => {
  const dispatch = useDispatch()
  const clusters = useSelector(state => state.clusters)
  useEffect(() => {
    dispatch(increment("pendingRequests"))
    fetchClusters().finally(() => dispatch(decrement("pendingRequests")))
  }, [])
  const handleSubmit = (values) => props.handleRegisterCluster(values.clusterName)
  const clusterNames = clusters.map(c => c.name)
  return (
    <Row className="register-cluster">
      <Col xl={{ span: 10, offset: 7 }} lg={{ span: 18, offset: 3 }}>
        <Card style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px', padding: '24px' }}>
          <Form onFinish={handleSubmit}>
            <FormItemLabel name="Name this cluster" description="Cluster name is used to identify this cluster uniquely in your invoices" />
            <Form.Item name="clusterName" rules={[{ required: true, message: 'Please input cluster name' }]}>
              <AutoComplete placeholder="e.g. Testing Cluster" dataSource={clusterNames} />
            </Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '24px' }} >Register cluster</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default RegisterCluster;