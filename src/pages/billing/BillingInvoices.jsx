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
import InfiniteScroll from 'react-infinite-scroller';
import { fetchInvoices, notify } from '../../utils';

function BillingInvoices() {
  useEffect(() => {
    ReactGA.pageview("/projects/billing/invoices");
  }, [])

  const { projectID } = useParams();
  const [hasMoreInvoices, setHasMoreInvoices] = useState(true)
  const invoices = useSelector(state => state.invoices)
  const loadInvoices = () => {
    const noOfInvoices = invoices.length
    const startingAfter = noOfInvoices > 0 ? invoices[noOfInvoices - 1].id : undefined
    fetchInvoices(startingAfter)
      .then((hasMore) => setHasMoreInvoices(hasMore))
      .catch(ex => notify("error", "Error fetching invoices", ex))
  }
  return (
    <div className="invoices">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="billing" />
      <div className='page-content page-content--no-padding'>
        <BillingTabs activeKey="invoices" projectID={projectID} />
        <div className="billing-tab-content">
          <InfiniteScroll
            pageStart={0}
            loadMore={loadInvoices}
            hasMore={hasMoreInvoices}
            loader={<div style={{ textAlign: "center" }} key={0}>Loading...</div>}
          >
            <InvoicesTable invoices={invoices} />
          </InfiniteScroll>
        </div>
      </div>
      <ContactUsFab />
    </div>
  );
}

export default BillingInvoices;

