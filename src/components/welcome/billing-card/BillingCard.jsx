import React from 'react';
import { Card } from 'antd';
import invoiceSvg from '../../../assets/invoice.svg';

const BillingCard = () => {
  return(
    <Card bordered title={<Card.Meta 
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      title='Usage Charges'
      avatar={<img src={invoiceSvg} />}
    />}
    style={{ background: '#F8FAFC', textAlign: 'left', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)' }}
    headStyle={{ borderBottom: '0.3px dashed #333333' }}>
      <p>Previous month : $18</p>
      <p>MTD : $12</p>
      <p>Expected for current month : $19</p>
    </Card>
  );
}

export default BillingCard;