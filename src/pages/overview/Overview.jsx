import React from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from "react-redux"
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
import { projectModules } from '../../constants';
import ResourcesCards from '../../components/overview/resources-cards/ResourcesCards'

function Overview() {
  const { projectID } = useParams()

  // Global state
  const clusterUpgraded = useSelector(state => isClusterUpgraded(state))
  return (
    <div className="overview">
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.OVERVIEW} />
      <div className="page-content ">
        <Row>
          <Col span={24}>
            <h3 style={{ marginBottom: 24 }}>Welcome Vinay Parab to Pegasis Mission Control</h3>

            <EndpointCard projectId={projectID} />
            <ResourcesCards />
            <Row gutter={[32, 16]} style={{ marginTop: 24 }}>
              <Col xl={7} sm={24}>
                <DiscordCard />
              </Col>
              <Col xl={7} sm={24} className="git-card">
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
