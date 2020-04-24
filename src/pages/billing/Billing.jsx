import React, { useEffect, useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import UpgradeCard from '../../components/billing/upgrade/UpgradeCard';
import FAQ from '../../components/billing/faq/FAQ';
import PlanDetails from '../../components/billing/plan/PlanDetails';
import BillingDetails from '../../components/billing/billing-details/BillingDetails';
import { Row, Col } from 'antd';
import Support from '../../components/billing/support/Support';
import Invoice from '../../components/billing/invoice/Invoice';
import ContactUs from '../../components/billing/contact/ContactUs';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from '../../components/billing/chekout-form/CheckoutForm';
import client from '../../client';
import { notify, setProjectConfig } from '../../utils';
import {increment, decrement, set, get} from 'automate-redux';
import {useDispatch, useSelector} from 'react-redux';
import store from '../../store';
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const Billing = () => {
    useEffect(() => {
		ReactGA.pageview("/projects/plans");
    }, [])
    // const subscribed = useSelector(state => state.billing.status)
    const subscribed = true
    const quotas = useSelector(state => state.quotas)
    const [contactModalVisible, setContactModalVisible] = useState(false)
    const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false)
    const [defaultSubject, setDefaultSubject] = useState("")
    const dispatch = useDispatch();

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
   
    const handleSubsriptionModalCancel = () =>{
        setSubscriptionModalVisible(false)
    }

    const handleStripePaymentMethod = (paymentMethodId) => {
        dispatch(increment("pendingRequests"));
        client.billing.setBillingSubscription(paymentMethodId).then(res => {
            if(res === 200){
                store.dispatch(set("billing", {status: true, invoices:[{}]}))
                setSubscriptionModalVisible(false);
                notify("success", "Success", "Sucessfully subscribed to space cloud pro")
            }
        }).catch(ex =>{
            console.log(ex)
            notify("error", "Error subcribing to space cloud pro", ex)
        }).finally(() => dispatch(decrement("pendingRequests")))
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
            <div>
                <Sidenav selectedItem="billing" />
                <div className="page-content">
                    {!subscribed && <div>
                    <h3 style={{ marginBottom:"0", fontSize:"21px"}}>Upgrade cluster</h3>
                        <p style={{ marginBottom:"1%"}}>This Space Cloud cluster is operating in opensource mode right now. Upgrade the cluster to a paid plan to get increased limits for the cluster</p>
                    </div>}
                    {subscribed && <h3 style={{ marginBottom:"1%", fontSize:"21px"}}>Plan Details & Support</h3>}
                    <Row>
                        <Col lg={{ span:24}}>
                            {!subscribed && <UpgradeCard handleSubscription={() => setSubscriptionModalVisible(true)}/>}
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
                    {!subscribed && <h3 style={{marginTop:"2%", marginBottom:"1%", fontSize:"21px"}}>Frequently asked questions</h3>}
                    {subscribed && <h3 style={{marginTop:"2%", marginBottom:"1%", fontSize:"21px"}}>Cluster details</h3>}
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
                {subscriptionModalVisible && <Elements stripe={stripePromise}>
                    <CheckoutForm handleCancel={handleSubsriptionModalCancel}
                    handleStripePayment={handleStripePaymentMethod} />
                </Elements>}
            </div>
        </div>
    )
}

export default Billing;