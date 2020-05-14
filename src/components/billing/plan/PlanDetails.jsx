import React, { useEffect, useState } from 'react';
import { useDispatch } from "react-redux"
import { Card, Button } from 'antd';
import crown from '../../../assets/crown.svg'
import client from "../../../client";
import { capitalizeFirstCharacter, notify } from '../../../utils';
import { increment, decrement } from 'automate-redux';

const PlanDetails = ({ plan, handleChangePlan }) => {
  const dispatch = useDispatch()
  const [planDetails, setPlanDetails] = useState({ product: { name: capitalizeFirstCharacter(plan) }, amount: 0, currency: "usd", quotas: { maxDatabases: 1, maxProjects: 1 } })
  useEffect(() => {
    if (plan) {
      dispatch(increment("pendingRequests"))
      client.billing.fetchPlanDetails(plan)
        .then((planDetails) => setPlanDetails(planDetails))
        .catch(ex => notify("error", "Error fetching cluster plan details", ex))
        .finally(() => dispatch(decrement("pendingRequests")))
    }
  }, [plan])
  const { maxDatabases, maxProjects } = planDetails.quotas
  const currencyNotation = planDetails.currency.toLowerCase() === "inr" ? "₹" : "$"
  return (
    <div>
      <h3 style={{ marginTop: "40px", marginBottom: "24px", fontSize: "21px" }}>Cluster details</h3>
      <Card>
        <h1 style={{ marginBottom: 0 }}><b>{planDetails.product.name}</b> <img src={crown} /></h1>
        <p style={{ marginTop: 0 }}>{currencyNotation}{planDetails.amount / 100}/month</p>
        <p style={{ marginTop: "5%" }}><b>Details:</b></p>
        <p>Project limits: {maxProjects} {maxProjects === 1 ? "project" : "projects"}</p>
        <p style={{ marginBottom: "10%" }}>Database limits: {maxDatabases} {maxDatabases === 1 ? "database" : "databases"}</p>
        <Button type='primary' style={{ width: "100%" }} onClick={handleChangePlan}>Change Plan</Button>
      </Card>
    </div>
  );
}

export default PlanDetails;