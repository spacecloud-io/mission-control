import React, { useEffect, useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import BillingTabs from '../../components/billing/billing-tabs/BillingTabs';
import SelectPlan from '../../components/billing/select-plan/SelectPlan';
import FAQ from '../../components/billing/faq/FAQ';
import PlanDetails from '../../components/billing/plan/PlanDetails';
import BillingDetails from '../../components/billing/billing-details/BillingDetails';
import { Row, Col } from 'antd';
import Support from '../../components/billing/support/Support';
import ContactUs from '../../components/billing/contact/ContactUs';
import client from '../../client';
import { notify, setProjectConfig } from '../../utils';
import {increment, decrement, set, get} from 'automate-redux';
import {useDispatch, useSelector} from 'react-redux';
import store from '../../store';
import { useParams, useHistory } from 'react-router-dom';
import './billing.css';

const BillingOverview = () => {
    useEffect(() => {
		ReactGA.pageview("/projects/plans");
    }, [])

    const { projectID } = useParams();
    // const subscribed = useSelector(state => state.billing.status)
    const subscribed = false
    const quotas = useSelector(state => state.quotas)
    const [contactModalVisible, setContactModalVisible] = useState(false)
    const [defaultSubject, setDefaultSubject] = useState("")
    const dispatch = useDispatch();
    const history = useHistory();

    const handleContactUsClick = () => {
        setContactModalVisible(true);
        setDefaultSubject("");
    }

    const handleIncreaseLimit = () => {
        setContactModalVisible(true);
        setDefaultSubject("Increase Space Cloud Pro limits");
    }

    const handleRequestFreeTrial = () => {
        setContactModalVisible(true);
        setDefaultSubject("Free trial for Space Cloud Pro");
    }

    const handleDiscount = () => {
        setContactModalVisible(true);
        setDefaultSubject("Request discount for Space Cloud Pro");
    }

    const handleCancel = () => {
        setContactModalVisible(false)
    }

    const handleContactUs = (subject, message) =>{
        dispatch(increment("pendingRequests"));
        const email = localStorage.getItem('email')
        const name = localStorage.getItem('name')
        client.billing.contactUs(email, name, subject, message).then(res => {
            if(res === 200){
                setContactModalVisible(false)
                notify("success", "Successfully sent message", "Our team will reach out to you shortly:)")
            }
        }).catch(ex =>{
            console.log(ex)
            notify("error", "Error sending message", ex)
        }).finally(() => dispatch(decrement("pendingRequests")))
    } 

    return (
        <div>
			<Topbar showProjectSelector />
			<Sidenav selectedItem="billing" />
			<div className='page-content page-content--no-padding'>
                <BillingTabs activeKey="overview" projectID={projectID} />
                <div className="billing-tab-content">
                    <Row>
                        <Col lg={{ span:24}}>
                            {!subscribed && <SelectPlan handleProPlan={() => history.push(`/mission-control/projects/${projectID}/billing/upgrade-cluster`)}/>}
                            {subscribed && 
                            <Row>
                                <Col lg={{ span:11 }}>
                                    <BillingDetails />
                                </Col>
                                <Col lg={{ span:11, offset:2 }}>
                                    <Support handleContactUs={handleContactUsClick} />
                                </Col>
                            </Row>}
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={{ span:18 }}>
                            {!subscribed && <FAQ handleRequestFreeTrial={handleRequestFreeTrial} handleDiscount={handleDiscount} />}
                        </Col>
                        <Col lg={{ span:11 }}>
                            {subscribed && <PlanDetails handleIncreaseLimit={handleIncreaseLimit} {...quotas}/>}
                        </Col>
                    </Row>
                </div>
                {contactModalVisible && <ContactUs 
                    initialvalues={defaultSubject}
                    handleContactUs={handleContactUs}
                    handleCancel={handleCancel} />}
            </div>
        </div>
    )
}

export default BillingOverview;