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
import { isClusterUpgraded } from '../../operations/cluster';
import { openBillingPortal } from '../../utils';

function Overview() {
  const { projectID } = useParams()
  useEffect(() => {
    ReactGA.pageview("/projects/overview");
  }, [])

  // Global state
  const clusterUpgraded = useSelector(state => isClusterUpgraded(state))
  const protocol = window.location.protocol
  const host = window.location.host
  return (
    <div className="overview">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="overview" />
      <div className="page-content ">
        <Row>
          <Col lg={{ span: 20 }} sm={{ span: 24 }}>
            <h3>GraphQL Endpoints</h3>
            <Col lg={{ span: 24 }} style={{ marginBottom: "3%" }}>
              <EndpointCard host={host} protocol={protocol} projectId={projectID} />
            </Col>
            <h3>Community</h3>
            <Row>
              <Col lg={{ span: 11, offset: 0 }}>
                <DiscordCard />
              </Col>
              <Col lg={{ span: 11, offset: 2 }} className="git-card">
                <GithubCard />
              </Col>
            </Row>
            {!clusterUpgraded && <div style={{ marginTop: 24 }}>
              <UpgradeCard handleClickUpgrade={openBillingPortal} />
            </div>}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Overview;
