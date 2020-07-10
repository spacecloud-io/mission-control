import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactGA from 'react-ga';
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import { Divider, Row, Col } from "antd";
import { increment, decrement } from "automate-redux";
import client from "../../../client";
import { setProjectConfig, notify, getProjectConfig } from "../../../utils";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import IngressTabs from "../../../components/ingress-routing/ingress-tabs/IngressTabs";
import Headers from "../../../components/ingress-routing/Headers";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";

function RoutingSettings() {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects);
  const loading = useSelector(state => state.pendingRequests > 0)

  useEffect(() => {
    ReactGA.pageview("/projects/ingress-routes/settings");
  }, [])

  let settings = getProjectConfig(projects, projectID, "modules.ingressRoutesGlobal", {});
  const { headers = [], resHeaders = [] } = settings

  const setRequestHeaders = (headers) => {
    dispatch(increment("pendingRequests"))
    const newSettings = Object.assign({}, settings, { headers: headers })
    client.routing.setRoutingGlobalConfig(projectID, newSettings)
      .then(() => {
        notify("success", "Success", "Saved the headers config successfully")
        setProjectConfig(projectID, "modules.ingressRoutesGlobal", newSettings)
      })
      .catch(ex => notify("error", "Error saving the headers config", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  const setResponseHeaders = (headers) => {
    dispatch(increment("pendingRequests"))
    const newSettings = Object.assign({}, settings, { resHeaders: headers })
    client.routing.setRoutingGlobalConfig(projectID, newSettings)
      .then(() => {
        notify("success", "Success", "Saved the headers config successfully")
        setProjectConfig(projectID, "modules.ingressRoutesGlobal", newSettings)
      })
      .catch(ex => notify("error", "Error saving the headers config", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }


  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem="routing" />
      <ProjectPageLayout>
        <IngressTabs projectID={projectID} activeKey="settings" />
        <Content>
          <Row>
            <Col lg={{ span: 20 }} sm={{ span: 24 }}>
              <FormItemLabel name="Modify request headers" description="These modifications will be made to each ingress request" />
              <Headers headers={headers} handleSubmit={setRequestHeaders} loading={loading} />
              <Divider />
              <FormItemLabel name="Modify response headers" description="These modifications will be made to the response of each ingress request" />
              <Headers headers={resHeaders} handleSubmit={setResponseHeaders} loading={loading} />
            </Col>
          </Row>
        </Content>
      </ProjectPageLayout>
    </div>
  );
}

export default RoutingSettings;
