import React from "react";
import { Button, Card } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons"


function Quotas({ quotas, clusterUpgraded, handleGetLicense }) {
  const maxProjects = quotas && quotas.maxProjects ? quotas.maxProjects : 1
  const maxDatabases = quotas && quotas.maxDatabases ? quotas.maxDatabases : 1

  return (
    <React.Fragment>
      <h2>Cluster quotas</h2>
      <Card>
        <p style={{ marginBottom: 8 }}>Max projects: {maxProjects}</p>
        <p style={{ marginBottom: 8 }}>Max databases/project: {maxDatabases}</p>
      </Card>
      {
        !clusterUpgraded && (
          <Button onClick={handleGetLicense} >Get a license <ArrowUpOutlined rotate={45} /></Button>
        )
      }
    </React.Fragment>
  )
}

export default Quotas