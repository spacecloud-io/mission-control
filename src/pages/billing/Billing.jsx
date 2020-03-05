import React, { useEffect, useState } from 'react'
import construction from "../../assets/construction.svg"
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import UpgradeCard from '../../components/billing/upgrade/UpgradeCard';
import FAQ from '../../components/billing/faq/FAQ';
import PlanDetails from '../../components/billing/plan/PlanDetails';
import { Row, Col } from 'antd';
import Support from '../../components/billing/support/Support';
import Invoice from '../../components/billing/invoice/Invoice';
import ContactUs from '../../components/billing/contact/ContactUs';

const Billing = () => {
    useEffect(() => {
		ReactGA.pageview("/projects/plans");
    }, [])
    const [subscribed, setSubscribed] = useState(true) 
    const [contactModalVisible, setContactModalVisible] = useState(false)

    return (
        <div>
            <Topbar showProjectSelector />
            <div>
                <Sidenav selectedItem="billing" />
                <div className="page-content">
                    {!subscribed && <h3 style={{ marginBottom:"1%"}}>Upgrade (currently using free plan)</h3>}
                    {subscribed && <h3 style={{ marginBottom:"1%"}}>Plan Details & Support</h3>}
                    <Row>
                        <Col lg={{ span:18}}>
                            {!subscribed && <UpgradeCard />}
                            {subscribed && 
                            <Row>
                                <Col lg={{ span:11 }}>
                                    <PlanDetails />
                                </Col>
                                <Col lg={{ span:11, offset:2 }}>
                                    <Support contact={() => setContactModalVisible(true)} />
                                </Col>
                            </Row>}
                        </Col>
                    </Row>
                    {!subscribed && <h3 style={{marginTop:"4%", marginBottom:"1%"}}>Frequently asked questions</h3>}
                    {subscribed && <h3 style={{marginTop:"4%", marginBottom:"1%"}}>Invoices</h3>}
                    <Row>
                        <Col lg={{ span:18 }}>
                            {!subscribed && <FAQ />}
                            {subscribed && <Invoice />}
                        </Col>
                    </Row>
                </div>
                {contactModalVisible && <ContactUs />}
            </div>
        </div>
    )
}

export default Billing;