import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from "react-redux"
import ReactGA from 'react-ga';
import '../../index.css'
import './overview.css'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import EndpointCard from '../../components/overview/Endpoint/EndpointCard';
import DiscordCard from '../../components/overview/discord/DiscordCard';
import GithubCard from '../../components/overview/github/GithubCard';
import UpgradeCard from '../../components/overview/upgrade/UpgradeCard';
import { Row, Col } from 'antd';
import history from "../../history"

function Overview() {
  const { projectID } = useParams()
  useEffect(() => {
    ReactGA.pageview("/projects/overview");
  }, [])

  const protocol = window.location.protocol
  const host = window.location.host
  const enterpriseMode = localStorage.getItem('enterprise') === 'true'
  const billingEnabled = useSelector(state => state.billing.status ? true : false)
  const handleClickUpgrade = () => {
    if (enterpriseMode) history.push(`/mission-control/projects/${projectID}/billing`)
    else window.open("https://console.spaceuptech.com/mission-control")
  }
  return (
    <div className="overview">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="overview" />
      <div className="page-content ">
        <Row>
          <Col lg={{span:20}}>
            <h3>GraphQL Endpoints</h3>
            <Col lg={{span:24}} style={{marginBottom:"3%"}}>
              <EndpointCard host={host} protocol={protocol} projectId={projectID} />
            </Col>
            <h3>Community</h3>
            <Row>
              <Col lg={{span:11, offset:0}}>
              <DiscordCard/>
              </Col>
              <Col lg={{span:11, offset:2}} className="git-card">
                <GithubCard/>
              </Col>
            </Row>
            {!billingEnabled && <Col lg={{ span:24 }} style={{marginTop:"3%"}}>
              <UpgradeCard handleClickUpgrade={handleClickUpgrade}/>
            </Col>}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Overview;
