import React from "react";
import { Row, Col, Card, Button, Typography, Upload } from "antd";
import IntegrationCard from "../integration-card/IntegrationCard";
import { incrementPendingRequests, decrementPendingRequests, notify, formatIntegrationImageUrl } from "../../../utils";
import { deleteIntegration } from "../../../operations/integrations";
import { useHistory, useParams } from "react-router-dom";
import { actionQueuedMessage } from "../../../constants";
import uploadSvg from '../../../assets/upload.svg';
import { useDispatch } from 'react-redux';
import { set } from 'automate-redux';

const { Paragraph } = Typography;

function IntegrationsList({ integrations, showUploadCard }) {

  const history = useHistory()
  const { projectID } = useParams()
  const dispatch = useDispatch();

  // Handlers
  const handleDelete = (integratonId) => {
    incrementPendingRequests()
    deleteIntegration(integratonId)
      .then(({ queued }) => {
        notify("success", "Success", queued ? actionQueuedMessage : "Uninstalled integration successfully")
      })
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

  const handleOpenConsole = (appUrl) => {
    if (!appUrl.startsWith("http")) {
      appUrl = window.location.origin + appUrl
    }
    window.open(appUrl, "_blank")
  }

  const handleUpload = file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = JSON.parse(e.target.result);
        dispatch(set('uploadedIntegration', result))
        history.push(`/mission-control/projects/${projectID}/integrations/install/${result.id}`, { useUploadedIntegration: true })
      } catch (error) {
        notify("error", "Error reading file", error)
      }
    }
    reader.readAsText(file)

    return false
  };

  return (
    <Row gutter={[24, 24]}>
      {showUploadCard && (
        <Col lg={{ span: 8 }}>
          <Card style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)', borderRadius: '10px', height: 300 }}>
            <center><img src={uploadSvg} style={{ width: 96, height: 96 }} />
              <h3 style={{ marginTop: 24 }}>Upload integration</h3>
              <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>
                Upload integration object directly to install integration
            </Paragraph>
            </center>
            <center style={{ position: "absolute", bottom: 24, left: 0, width: "100%" }}>
              <Upload name='file' accept='.json' beforeUpload={handleUpload} showUploadList={false}>
                <Button type='primary' ghost>Upload</Button>
              </Upload>
            </center>
          </Card>
        </Col>
      )}
      {integrations.map(({ id, name, description, installed, appUrl }) => {
        return (
          <Col lg={{ span: 8 }}>
            <IntegrationCard
              name={name}
              desc={description}
              imgUrl={formatIntegrationImageUrl(id)}
              installed={installed}
              handleDelete={() => handleDelete(id)}
              handleViewDetails={() => handleViewDetails(id)}
              handleViewPermissions={() => handleViewPermissions(id)}
              handleOpenConsole={() => handleOpenConsole(appUrl)}
              handleInstall={() => handleInstall(id)}
            />
          </Col>
        )
      })}
    </Row>
  )
}

export default IntegrationsList