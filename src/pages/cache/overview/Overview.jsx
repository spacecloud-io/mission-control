import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Card } from "antd";
import Sidenav from '../../../components/sidenav/Sidenav'
import Topbar from '../../../components/topbar/Topbar'
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import { projectModules } from "../../../constants";
import ConfigCard from "../../../components/cache/config-card/ConfigCard";
import { Row, Col } from "antd"
import { ArrowRightOutlined } from "@ant-design/icons";
import ConfigureCache from "../../../assets/cache.svg";
import { incrementPendingRequests, decrementPendingRequests, notify } from "../../../utils";
import { loadCacheConnState, saveCacheConfig, getCacheConnState, getCacheConfig } from "../../../operations/cache";

const Overview = () => {
  const { projectID } = useParams()
  const history = useHistory();
  const config = useSelector(state => getCacheConfig(state))
  const connected = useSelector(state => getCacheConnState(state))

  useEffect(() => {
    if (projectID && config.enabled) {
      incrementPendingRequests()
      loadCacheConnState(projectID)
        .catch(ex => notify("error", "Error loading cache connection status", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID, config.enabled])

  const handleDisableCache = () => {
    const config = { enabled: false, conn: "" }
    incrementPendingRequests()
    saveCacheConfig(projectID, config)
      .then(() => notify("success", "Success", "Disabled cache successfully"))
      .catch(ex => notify("error", "Error disabling cache", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleEditConfig = () => {
    history.push(`/mission-control/projects/${projectID}/cache/configure`)
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.CACHE} />
      <ProjectPageLayout>
        <Content>
          {config && config.enabled ?
            <Row>
              <Col sm={24} lg={16} xl={12}>
                <p style={{ fontSize: 16, marginBottom: 16 }}>Caching Config</p>
                <ConfigCard values={{ connected, ...config }} disableCache={handleDisableCache} editConfig={handleEditConfig} />
                <p style={{ fontSize: 16, marginTop: 32, marginBottom: 16 }}>Actions</p>
                <Card bordered style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
                  <p style={{ marginBottom: 24, fontSize: 14 }}>
                    <b>Purge cache</b><br />
                    <p>Purge cache of all or particular tables. You might want to purge  cache in dev environment especifically for debugging.</p>
                  </p>
                  <Button danger onClick={() => history.push(`/mission-control/projects/${projectID}/cache/purge-cache`)}>Purge cache <ArrowRightOutlined /></Button>
                </Card>
              </Col>
            </Row> :
            <div className="panel">
              <img src={ConfigureCache} style={{ width: "auto" }} />
              <p className="panel__description" style={{ marginTop: 48, marginBottom: 0 }}>
                Improve your app performance by caching database query results via Space Cloud’s caching module
                            </p>
              <Button type="primary action-rounded" style={{ marginTop: 16, padding: "0px 42px" }} onClick={() => history.push(`/mission-control/projects/${projectID}/cache/configure`)}>
                Enable Caching
                            </Button>
            </div>
          }
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  )
}

export default Overview