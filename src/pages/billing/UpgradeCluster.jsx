import React, { useEffect, useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import { useParams, useHistory } from 'react-router-dom';
import { Button, Icon, Steps, Col, Row } from 'antd';
import SigninCard from '../../components/signup/signin-card/SigninCard';
import AddBillingDetail from '../../components/billing/upgrade/AddBillingDetail';
import {loadStripe} from '@stripe/stripe-js';
import store from '../../store';
import client from '../../client';
import { notify } from '../../utils';
import { set, increment, decrement } from 'automate-redux';
import { useDispatch } from 'react-redux';

import './billing.css';
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const UpgradeCluster = () => {

    useEffect(() => {
		ReactGA.pageview("/projects/upgrade");
    }, [])

    const { projectID } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const [current, setCurrent] = useState(0);
    const { Step } = Steps; 

    const handleStripePaymentMethod = (paymentMethodId) => {
        dispatch(increment("pendingRequests"));
        client.billing.setBillingSubscription(paymentMethodId).then(res => {
            if(res === 200){
                store.dispatch(set("billing", {status: true, invoices:[{}]}))
                notify("success", "Success", "Sucessfully subscribed to space cloud pro")
            }
        }).catch(ex =>{
            console.log(ex)
            notify("error", "Error subcribing to space cloud pro", ex)
        }).finally(() => dispatch(decrement("pendingRequests")))
    }

    const steps = [{
        title: 'Create account',
        content: <React.Fragment>
            <SigninCard 
                handleGoogle={()=> setCurrent(current + 1)}
                handleTwitter={()=> setCurrent(current + 1)}
                handleGithub={()=> setCurrent(current + 1)}
             />
        </React.Fragment>
    },
    {
        title: 'Add billing details',
        content: <React.Fragment>
            <AddBillingDetail 
                stripePromise={stripePromise} 
                handleStripePaymentMethod={handleStripePaymentMethod}
            />
        </React.Fragment>
    },
    {
        title: 'Register cluster',
        content: <React.Fragment>
            <SigninCard />
        </React.Fragment>
    }]

    return (
        <React.Fragment>
            <Topbar showProjectSelector/>
            <div>
                <Sidenav selectedItem='billing' />
                <div className='page-content page-content--no-padding'>
                    <div style={{
                        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
                        height: 48,
                        lineHeight: 48,
                        zIndex: 98,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 16px"
                    }}>
                        <Button type="link" onClick={() => history.push(`/mission-control/projects/${projectID}/billing/overview`)}>
                            <Icon type="left" />
                            Go back
                            </Button>
                        <span style={{ marginLeft: '35%' }}>
                            Upgrade Cluster
                            </span>
                    </div><br />
                    <div>
                    <Row>
                        <Col lg={{ span: 12, offset: 6 }} xs={{ span: 24 }} >
                            <Steps current={current} className="upgrade-steps" size="small">
                            {steps.map(item => (
                                <Step key={item.title} title={item.title} />
                            ))}
                            </Steps><br />
                        </Col>
                    </Row>
                    {steps[current].content}
                    </div>
                </div>
            </div>
        </React.Fragment>    
    );
} 

export default UpgradeCluster;