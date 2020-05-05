import React, { useEffect } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import BillingTabs from '../../components/billing/billing-tabs/BillingTabs';
import PlanDetails from '../../components/billing/plan/PlanDetails';
import BillingDetails from '../../components/billing/billing-details/BillingDetails';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import { Row, Col } from 'antd';
import BalanceCredit from '../../components/billing/balance-credit/BalanceCredit';
import ContactUsFab from "../../components/billing/contact-us/ContactUsFab";
import { getClusterPlan } from '../../utils';
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
  const plan = useSelector(state => getClusterPlan(state))

  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="billing" />
      <div className='page-content page-content--no-padding'>
        <BillingTabs activeKey="overview" projectID={projectID} />
        <div className="billing-tab-content">
          <Row gutter={48}>
            <Col lg={{ span: 11 }}>
              <BillingDetails name={name} email={email} billingDetails={billingDetails} />
            </Col>
            <Col lg={{ span: 11, offset: 2 }}>
              <BalanceCredit balanceCredits={balanceCredits} />
            </Col>
          </Row>
          <Row>
            {plan === "open" && <Col lg={{ span: 24 }}>
              <h3 style={{ marginBottom: "0", fontSize: "21px", marginTop: 24 }}>Upgrade cluster</h3>
              <p style={{ marginBottom: "24px" }}>This Space Cloud cluster is operating in opensource mode right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
              <SelectPlan
                selectedPlan={plan}
                handleSelectPlan={(plan) => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`, { plan })}
                handleContactUs={() => history.push(`/mission-control/projects/${projectID}/billing/contact-us`)} />
            </Col>}
            {plan !== "open" && <Col lg={{ span: 11 }}>
              <PlanDetails plan={plan} handleChangePlan={() => history.push(`/mission-control/projects/${projectID}/billing/change-plan`)} />
            </Col>}
          </Row>
        </div>
        <ContactUsFab />
      </div>
    </div>
  )
}

export default BillingOverview;