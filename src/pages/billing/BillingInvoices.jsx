import React, { useEffect, useState } from 'react'
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import BillingTabs from '../../components/billing/billing-tabs/BillingTabs';
import InvoicesTable from '../../components/billing/invoices/InvoicesTable';
import ContactUsFab from "../../components/billing/contact-us/ContactUsFab";
import { useParams } from 'react-router-dom';
import './billing.css'
import { useSelector } from 'react-redux';

const BillingInvoices = () => {
  useEffect(() => {
    ReactGA.pageview("/projects/billing/invoices");
  }, [])

  const { projectID } = useParams();
  const invoices = useSelector(state => state.billing.invoices)

  return (
    <div className="invoices">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="billing" />
      <div className='page-content page-content--no-padding'>
        <BillingTabs activeKey="invoices" projectID={projectID} />
        <div className="billing-tab-content">
          <InvoicesTable invoices={invoices} />
        </div>
      </div>
      <ContactUsFab />
    </div>
  );
}

export default BillingInvoices;

