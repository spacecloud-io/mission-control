import React, { useState } from 'react';
import { Card, Row, Col } from 'antd';
import Topbar from '../../../components/topbar/Topbar';
import AddCardInfo from '../../../components/billing/add-card/AddCardInfo';
import AddCardForm from '../../../components/billing/add-card/AddCardForm';
import './add-card.css';
import CardSuccess from '../../../components/billing/add-card/CardSuccess';
import { useHistory } from 'react-router';

const AddCard = () => {

  const [cardSuccessModalVisible, setCardSuccessModalVisible] = useState(false)
  const history = useHistory();

  const redirectToCreateProject = () => {
    history.push('/mission-control/create-project');
  }

  const redirectToWelcome = () => {
    history.push('/mission-control/welcome');
  }

  return(
    <React.Fragment>
      <Topbar />
      <div className='welcome-content'>
        <h2 className='welcome-title'>Glad you want to explore the full potential of SpaceCloud</h2>
        <p className='welcome-subtitle'>Your credit card details are safe with us.</p>
        <Row>
          <Col xs={{ span: 22, offset: 1 }} lg={{ span: 16, offset: 4 }} xl={{ span: 14, offset: 5 }} className='add-card'>
            <Card bordered>
              <Row>
                <Col xs={{ span: 22, offset: 1 }} lg={{ span: 16, offset: 0 }} xl={{ span: 18, offset: 0 }} className='form-card'>
                  <AddCardForm />
                </Col>
                <Col xs={{ span: 22, offset: 1 }} lg={{ span: 8, offset: 0 }} xl={{ span: 6, offset: 0 }} className='info-card'>
                  <AddCardInfo />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row> 
      </div>
      {cardSuccessModalVisible && <CardSuccess
        redirectToCreateProject={redirectToCreateProject} 
        redirectToWelcome={redirectToWelcome} />}
    </React.Fragment>
  );
}

export default AddCard;