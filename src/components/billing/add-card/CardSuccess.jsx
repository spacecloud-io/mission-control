import React from 'react';
import { Button, Modal, Row, Col } from 'antd';
import './card-success.css'

const CardSuccess = ({ redirectToCreateProject, redirectToWelcome }) => {

  return(
    <Modal 
      visible={true} 
      footer={null} 
      closable={false}
      width={670}
      className='success-modal'>
      <Row gutter={[16, 16]}>
        <Col xs={{ span: 24, offset: 0 }} lg={{ span: 16, offset: 4 }}>
          <h2 className='success-title'>Credit card added successfully!</h2>
          <p className='success-des'>Experience the full potential of SpaceCloud. Start your first project.</p>
        </Col>
        <Col xs={{ span: 24, offset: 0 }} lg={{ span: 11, offset: 1 }}>
          <Button type='primary' ghost className='button-option' onClick={redirectToWelcome}>I will do it later</Button>
        </Col>
        <Col xs={{ span: 24, offset: 0 }} lg={{ span: 11, offset: 0 }}>  
          <Button type='primary' className='button-option' onClick={redirectToCreateProject}>Yes, lets start</Button>
        </Col>
      </Row>
    </Modal>
  );
}

export default CardSuccess;