import React from 'react';
import { Collapse, Button } from 'antd';

const {Panel} = Collapse;
const FAQ = (props) => {
    return(
        <div className="faq">
            <Collapse accordion>
                <Panel header="Is there a free trial?" key='1'>
                    <p>The pro version does not have a free trial as of now. 
                        However, if you want a free trial before subscribing to Pro version, let us know. 
                        We can arrange one for you!</p>
                    <Button type="primary" ghost onClick={props.handleRequestFreeTrial}>Request free trial</Button>
                </Panel>
                <Panel header="Any discounts for startups, NGOs or academic institutes?" key='2'>
                    <p>If you are a small team, we would love to help you! 
                        Get in touch with us and we can figure out an affordable 
                        pricing for you after discussing your use case.</p>
                    <Button type="primary" ghost onClick={props.handleDiscount}>Contact us</Button>
                </Panel>
                <Panel header="Can I increase the limits of Pro version" key='3'>
                    <p>Absolutely! Each additional resource will add the following extra costs to your monthly subscription fee:</p>
                    <p><b>$10</b> per additional database</p>
                    <p><b>$50</b> per additional project</p>
                    <p><b>$100</b> per additional cluster</p>
                </Panel>
                <Panel header="Can I upgrade multiple Space Cloud clusters?" key='4'>
                    <p></p>
                </Panel>
                <Panel header="How do I cancel my subscription?" key='5'>
                    <p>You can cancel your subscription anytime by sending us an email. 
                        We will setup a quick call to take your feedback and that’s it.</p>
                </Panel>
            </Collapse>
        </div>
    );
}

export default FAQ;