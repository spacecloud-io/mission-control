import React from 'react';
import { Collapse, Button } from 'antd';

const { Panel } = Collapse;
const FAQ = (props) => {
  return (
    <div className="faq">
      <h3 style={{ marginTop: "48px", marginBottom: "32px", fontSize: "21px" }}>Frequently asked questions</h3>
      <Collapse accordion>
        <Panel header="Is there a free trial?" key='1'>
          <p>Space Cloud commercial edition does not have a free trial as of now. Instead we give free credits so that you can try out the commercial edition. Use this coupon code - <b>i-love-spacecloud</b> while upgrading your cluster to get free credits😛</p>
        </Panel>
        <Panel header="Any discounts for startups, NGOs or academic institutes?" key='2'>
          <p>If you are a small team, we would love to help you!
          Get in touch with us and we can figure out an affordable pricing for you after discussing your use case.</p>
          <Button type="primary" ghost onClick={props.handleDiscount}>Contact us</Button>
        </Panel>
        <Panel header="Can I increase the limits of Pro version" key='3'>
          <p>Absolutely! Each additional resource will add the following extra costs to your monthly subscription fee:</p>
          <p><b>$10</b> per additional database</p>
          <p><b>$50</b> per additional project</p>
          <p><b>$100</b> per additional cluster</p>
        </Panel>
        <Panel header="Can I upgrade multiple Space Cloud clusters?" key='4'>
          <p>
            Absolutely!😁 You can upgrade all your clusters one by one independently from their Mission Control.
          </p>
        </Panel>
        <Panel header="How do I cancel my subscription?" key='5'>
          <p>You can cancel your subscription anytime by downgrading your cluster to open source plan.</p>
        </Panel>
      </Collapse>
    </div>
  );
}

export default FAQ;