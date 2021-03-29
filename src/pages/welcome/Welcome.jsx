import React from 'react'
import { Link } from "react-router-dom"
import './welcome.css'
import { Button, Col, Divider, Row } from 'antd';
import Topbar from '../../components/topbar/Topbar';
import { useSelector } from 'react-redux';
import crediCardSvg from '../../assets/credit-card.svg';
import rocketSvg from '../../assets/rocket.svg';
import docsSvg from '../../assets/docs.svg';
import videoSvg from '../../assets/video.svg';
import discordSvg from '../../assets/discord.svg';
import githubSvg from '../../assets/github-outlined.svg';
import BillingCard from '../../components/welcome/billing-card/BillingCard';
import ProjectCard from '../../components/welcome/project-card/ProjectCard';

const Welcome = () => {

  const name = localStorage.getItem('name');
  const billing = '';
  const projects = useSelector(state => state.projects);

  return (
    <React.Fragment>
      <Topbar />
      <div className='welcome-content'>
        <h2 className='welcome-title'>Welcome {name} to SpaceCloud Mission Control.</h2>
        {!billing && !projects && 
          <p className='welcome-subtitle'>An amazing DevOps experiece awaits you.</p>}
        {!billing || !projects || projects.length === 0 ? <p className='welcome-ins'>Here’s what you can do next</p> : <p>Here’s what you have been upto</p>}
        <Row gutter={['16', '16']} style={{ marginTop: '54px', marginRight: 0, marginLeft: 0 }}>
          <Col xs={{ span: 16, offset: 4 }} lg={{ span: 5, offset: 6 }}>
            {!billing ? <Link to='/mission-control/billing/add-card'>
              <img src={crediCardSvg} className='act-img' />
              <p className='act-text'>Update your billing details and experience full potential of SpaceCloud</p>
            </Link> :
            <BillingCard/>}
          </Col>
          {!billing && !projects || projects.length === 0 && <Col xs={{ span: 16, offset: 4 }} lg={{ span: 2, offset: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Divider type={window.screen.width < 992 ? 'horizontal' : 'vertical'} style={window.screen.width < 992 ? { borderColor: '#666666' } : { height: '80%', borderColor: '#666666' }} />
          </Col>}
          {!projects || projects.length === 0 && <Col xs={{ span: 16, offset: 4 }} lg={{ span: 5, offset: 0 }}>
            <Link to='/mission-control/create-project'>
              <img src={rocketSvg} className='act-img' />
              <p className='act-text'>Utilize your $300 free credits by creating your first project.</p>
            </Link> 
          </Col>}
          {projects && projects.length > 0 && <Col lg={{ span: 12 }}>
            <Row gutter={['16', '16']}>
              {projects.map(project => {
                return(<Col key={project.id} xs={{ span: 22, offset: 1 }} lg={{ span: 10 }}>
                  <ProjectCard projectName={project.name} />
                </Col>);
              })}
            </Row>
          </Col>}
          <Col xs={{ span: 20, offset: 2 }} lg={{ span: 18, offset: 3 }} style={{ marginTop: '48px', marginBottom: '40px' }}>
            <Divider dashed={true} style={{ borderColor: '#666666' }} />
          </Col>
          <Col xs={{ span: 10, offset: 2 }} lg={{ span: 4, offset: 4 }}>
            <a href='https://docs.spaceuptech.com/' target='_blank'>
              <img src={docsSvg} className='res-img' />
              <p className='res-text'>View documentation</p>
            </a>
          </Col>
          <Col xs={{ span: 10, offset: 0 }} lg={{ span: 4, offset: 0 }}>
            <a href='https://www.youtube.com/channel/UCDI38thbdf0sdOIHFdSyvUg' target='_blank'>
              <img src={videoSvg} className='res-img' />
              <p className='res-text'>Learn through videos</p>
            </a>
          </Col>
          <Col xs={{ span: 10, offset: 2 }} lg={{ span: 4, offset: 0 }}>
            <a href='https://discord.com/invite/RkGjW93' target='_blank'>
              <img src={discordSvg} className='res-img' />
              <p className='res-text'>Join our Discord community</p>
            </a>
          </Col>
          <Col xs={{ span: 10, offset: 0 }} lg={{ span: 4, offset: 0 }}>
            <a href='https://github.com/spaceuptech/space-cloud' target='_blank'>
              <img src={githubSvg} className='res-img' />
              <p className='res-text'>Visit us on Github</p>
            </a>
          </Col>
        </Row>
      </div>    
    </React.Fragment>
  )
}

export default Welcome;
