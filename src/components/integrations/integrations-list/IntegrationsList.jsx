import React from "react";
import { Row, Col } from "antd";
import IntegrationCard from "../integration-card/IntegrationCard";
import { incrementPendingRequests, decrementPendingRequests, notify, formatIntegrationImageUrl } from "../../../utils";
import { deleteIntegration } from "../../../operations/integrations";
import { useHistory, useParams } from "react-router-dom";

function IntegrationsList({ integrations }) {

  const history = useHistory()
  const { projectID } = useParams()

  // Handlers
  const handleDelete = (integratonId) => {
    incrementPendingRequests()
    deleteIntegration(integratonId)
      .then(() => notify("success", "Success", "Deleted integration successfully"))
      .catch((ex) => notify("error", "Error deleting integration", ex))
      .finally(() => decrementPendingRequests())
  }

  const handleViewDetails = (integratonId) => {
    history.push(`/mission-control/projects/${projectID}/integrations/details/${integratonId}`)
  }

  const handleViewPermissions = (integratonId) => {
    history.push(`/mission-control/projects/${projectID}/integrations/permissions/${integratonId}`)
  }

  const handleInstall = (integratonId) => {
    history.push(`/mission-control/projects/${projectID}/integrations/details/${integratonId}`)
  }

  const handleOpenConsole = (integratonId) => {
    history.push(`/integrations/${integratonId}`)
  }

  return (
    <Row gutter={[24, 24]}>
      {integrations.map(({ id, name, desc, installed }) => {
        return (
          <Col lg={{ span: 8 }}>
            <IntegrationCard
              name={name}
              desc={desc}
              imgUrl={formatIntegrationImageUrl(id)}
              installed={installed}
              handleDelete={() => handleDelete(id)}
              handleViewDetails={() => handleViewDetails(id)}
              handleViewPermissions={() => handleViewPermissions(id)}
              handleOpenConsole={() => handleOpenConsole(id)}
              handleInstall={() => handleInstall(id)}
            />
          </Col>
        )
      })}
    </Row>
  )
}

export default IntegrationsList