import React, { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { Row, Col, Card, Button } from 'antd';
import './register-cluster.css';
import ApplyCouponForm from "./ApplyCouponForm"
import client from "../../../client"
import { increment, decrement } from 'automate-redux';
import { setClusterPlan, notify, capitalizeFirstCharacter } from '../../../utils';

const StartSubscription = ({ plan, countryCode, handleSuccess }) => {
  const dispatch = useDispatch()
  const [planDetails, setPlanDetails] = useState({ product: { name: capitalizeFirstCharacter(plan) }, amount: 0, currency: "usd", quotas: { maxProjects: 1, maxDatabases: 1 } })
  useEffect(() => {
    const planId = countryCode === "IN" ? (plan + "-inr") : plan
    dispatch(increment("pendingRequests"))
    client.billing.fetchPlanDetails(planId)
      .then(planDetails => setPlanDetails(planDetails))
      .catch(ex => notify("error", "Error fetching plan details", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }, [plan, countryCode])
  const handleStartSubscription = () => {
    setClusterPlan(plan).then(() => {
      notify("success", "Success", `Successfully applied ${planDetails.product.name} to this cluster`)
      handleSuccess()
    })
  }
  const currencyNotation = planDetails.currency.toLowerCase() === "inr" ? "₹" : "$"
  return (
    <Row>
      <Col xl={{ span: 10, offset: 7 }} lg={{ span: 18, offset: 3 }}>
        <Card style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px', padding: '24px' }}>
          <p><b>Subscription details</b></p>
          <Card title={<p style={{ fontSize: "18px" }}>{planDetails.product.name}</p>} extra={<p style={{ fontSize: "18px" }}><span style={{ color: "#34A853" }}>{currencyNotation}{planDetails.amount / 100}</span> per month</p>}>
            <p><b>Total Projects</b>: {planDetails.quotas.maxProjects}</p>
            <p><b>Total Databases</b>: {planDetails.quotas.maxDatabases} per project</p>
          </Card>
          <ApplyCouponForm />
          <Button type="primary" style={{ width: '100%', marginTop: '24px' }} onClick={handleStartSubscription}>Start subscription</Button>
        </Card>
      </Col>
    </Row>
  );
}

export default StartSubscription;