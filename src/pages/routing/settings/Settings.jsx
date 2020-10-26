import React, { useEffect } from "react";
import { useSelector } from "react-redux"
import Sidenav from "../../../components/sidenav/Sidenav";
import Topbar from "../../../components/topbar/Topbar";
import { useParams } from "react-router-dom";
import { Divider, Row, Col } from "antd";
import { notify, incrementPendingRequests, decrementPendingRequests } from "../../../utils";
import ProjectPageLayout, { Content } from "../../../components/project-page-layout/ProjectPageLayout"
import IngressTabs from "../../../components/ingress-routing/ingress-tabs/IngressTabs";
import Headers from "../../../components/ingress-routing/Headers";
import FormItemLabel from "../../../components/form-item-label/FormItemLabel";
import { getIngressRoutesGlobalConfig, saveIngressGlobalRequestHeaders, saveIngressGlobalResponseHeaders, loadIngressRoutesGlobalConfig } from "../../../operations/ingressRoutes";
import { projectModules, actionQueuedMessage } from "../../../constants";

function RoutingSettings() {
  const { projectID } = useParams();

  // Global state
  const loading = useSelector(state => state.pendingRequests > 0)
  const settings = useSelector(state => getIngressRoutesGlobalConfig(state))
  const { headers = [], resHeaders = [] } = settings

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadIngressRoutesGlobalConfig(projectID)
        .catch(ex => notify("error", "Error fetching global settings of ingress routes", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  const setRequestHeaders = (headers) => {
    incrementPendingRequests()
    saveIngressGlobalRequestHeaders(projectID, headers)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Saved the headers config successfully"))
      .catch(ex => notify("error", "Error saving the headers config", ex))
      .finally(() => decrementPendingRequests())
  }

  const setResponseHeaders = (headers) => {
    incrementPendingRequests()
    saveIngressGlobalResponseHeaders(projectID, headers)
      .then(({ queued }) => notify("success", "Success", queued ? actionQueuedMessage : "Saved the headers config successfully"))
      .catch(ex => notify("error", "Error saving the headers config", ex))
      .finally(() => decrementPendingRequests())
  }


  return (
    <div>
      <Topbar showProjectSelector />
      <Sidenav selectedItem={projectModules.INGRESS_ROUTES} />
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
