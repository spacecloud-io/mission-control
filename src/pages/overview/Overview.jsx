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
import { Row, Col, Card, Select } from 'antd';
import { isClusterUpgraded } from '../../operations/cluster';
import { openBillingPortal } from '../../utils';
import { projectModules } from '../../constants';

const cardStyles = {
  overflow: "hidden",
  border: "0.3px solid #C4C4C4",
  boxShadow: "-2px -2px 8px rgba(0, 0, 0, 0.15), 2px 2px 8px rgba(0, 0, 0, 0.15)",
  borderRadius: "5px"
}

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
            <Row gutter={[32, 16]} style={{ marginTop: 24 }}>
              <Col xl={8} sm={24}>
                <Card style={cardStyles}>
                  <h3 style={{ marginBottom: 16 }}>API requests handled</h3>
                  <Row>
                    <Col style={{ paddingRight: 32, borderRight: "0.3px solid darkgrey" }}>
                      <h1 style={{ margin: 0, padding: 0 }}>32</h1>
                      <h3 style={{ margin: 0, padding: 0, color: "darkgrey" }}>Ingress</h3>
                    </Col>
                    <Col style={{ paddingLeft: 32 }}>
                      <h1 style={{ margin: 0, padding: 0 }}>18</h1>
                      <h3 style={{ margin: 0, padding: 0, color: "darkgrey" }}>GraphQL</h3>
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col xl={6} sm={24}>
                <Card style={cardStyles}>
                  <h3 style={{ marginBottom: 16 }}>Error Rate</h3>
                  <h1 style={{ margin: 0, padding: 0 }}>03</h1>
                  <h3 style={{ margin: 0, padding: 0, color: "darkgrey" }}>Errors</h3>
                </Card>
              </Col>
              <Col xl={10} sm={24}>
                <Card style={{ height: "100%" }}>
                  <div style={{ fontSize: 14, marginBottom: 8 }}><b>Billable resources of Pegasis</b></div>
                  <Row>
                    <Col span={12} style={{ borderRight: "0.3px solid darkgrey" }}>
                      <p style={{ marginBottom: 0, lineHeight: "24px" }}>
                        Database: 4 <br />
                        RAM: 4GB <br />
                        Server space: 6GB <br />
                      </p>
                    </Col>
                    <Col span={12}>
                      <p style={{ marginBottom: 0, lineHeight: "24px", marginLeft: 24 }}>
                        Estimated Billing this month
                        <h3>$ 18.3</h3>
                      </p>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
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
