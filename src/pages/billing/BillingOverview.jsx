import React, { useEffect } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import BillingTabs from '../../components/billing/billing-tabs/BillingTabs';
import PlanDetails from '../../components/billing/plan/PlanDetails';
import BillingDetails from '../../components/billing/billing-details/BillingDetails';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import ProjectPageLayout, { InnerTopBar, Content } from "../../components/project-page-layout/ProjectPageLayout"
import { Row, Col, Card, Button, Space } from 'antd';
import BalanceCredit from '../../components/billing/balance-credit/BalanceCredit';
import ContactUsFab from "../../components/billing/contact-us/ContactUsFab";
import { getClusterPlan, getClusterId } from '../../utils';
import { useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import './billing.css';

const BillingOverview = () => {
  useEffect(() => {
    ReactGA.pageview("/projects/billing/overview");
  }, [])

  const { projectID } = useParams();
  const history = useHistory();
  const name = localStorage.getItem("name")
  const email = localStorage.getItem("email")
  const billingDetails = useSelector(state => state.billing.details)
  const balanceCredits = useSelector(state => state.billing.balanceCredits)
  const countryCode = useSelector(state => state.billing.details.country)
  const currencyNotation = countryCode === "IN" ? "₹" : "$"
  const plan = useSelector(state => getClusterPlan(state))
  const clusterId = useSelector(state => getClusterId(state))
  const clusterRegistered = clusterId ? true : false

  const handleClickRegisterCluster = () => history.push(`/mission-control/projects/${projectID}/billing/register-cluster`)

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="billing" />
      <ProjectPageLayout>
        <BillingTabs activeKey="overview" projectID={projectID} />
        <Content>
          <Row gutter={48} style={{ height: 360 }}>
            <Col lg={{ span: 11 }}>
              <BillingDetails name={name} email={email} billingDetails={billingDetails} />
            </Col>
            <Col lg={{ span: 11, offset: 2 }}>
              <BalanceCredit currencyNotation={currencyNotation} balanceCredits={balanceCredits} />
            </Col>
          </Row>
          {!clusterRegistered && <Row style={{ marginTop: 32 }}>
            <Col lg={{ span: 24 }}>
              <Card style={{ textAlign: "center" }}>
                <Space size="large">
                  <span>Register this cluster with your billing account</span>
                  <Button type="primary" ghost onClick={handleClickRegisterCluster}>Register Cluster</Button>
                </Space>
              </Card>
            </Col>
          </Row>}
          <Row>
            {plan.startsWith("space-cloud-open") && <Col lg={{ span: 24 }}>
              <h3 style={{ marginBottom: "0", fontSize: "21px", marginTop: 24 }}>Upgrade cluster</h3>
              <p style={{ marginBottom: "24px" }}>This Space Cloud cluster is operating in opensource plan right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
              <SelectPlan
                selectedPlan={plan}
                handleSelectPlan={(plan) => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`, { plan })}
                handleContactUs={(subject) => history.push(`/mission-control/projects/${projectID}/billing/contact-us`, { subject })} />
            </Col>}
            {!plan.startsWith("space-cloud-open") && <Col lg={{ span: 11 }}>
              <PlanDetails plan={plan} handleChangePlan={() => history.push(`/mission-control/projects/${projectID}/billing/change-plan`)} />
            </Col>}
          </Row>
        </Content>
        <ContactUsFab />
      </ProjectPageLayout>
    </div>
  )
}

export default BillingOverview;