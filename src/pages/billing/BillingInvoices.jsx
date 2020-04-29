import React, { useEffect, useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import BillingTabs from '../../components/billing/billing-tabs/BillingTabs';
import Invoice from '../../components/billing/invoice/Invoice';
import { useParams } from 'react-router-dom';
import './billing.css'

const BillingInvoices = () => {
    useEffect(() => {
		ReactGA.pageview("/projects/billing/invoices");
    }, [])

    const { projectID } = useParams();
    // const subscribed = useSelector(state => state.billing.status)
    const subscribed = false

    return(
    <div className="invoices">
			<Topbar showProjectSelector />
			<Sidenav selectedItem="billing" />
			<div className='page-content page-content--no-padding'>
                <BillingTabs activeKey="invoices" projectID={projectID} />
                <div className="billing-tab-content">
                    <Invoice />
                </div>
            </div>
    </div>
    );
}

export default BillingInvoices;

