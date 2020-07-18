import React from "react";
import { Button, Space, Card } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons"
import crownSvg from "../../../assets/crown.svg"

function LicenseDetails({ clusterName, licenseKey, licenseType, nextRenewal }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "rgba(0,0,0,0.56)", fontWeight: "bold", fontSize: "16px", marginRight: 4 }}>{licenseType}</span>
        <img src={crownSvg} alt="Crown" />
      </div>
      <p style={{ marginBottom: 8 }}>License key: {licenseKey}</p>
      <p style={{ marginBottom: 8 }}>Cluster name: {clusterName}</p>
      <p style={{ marginBottom: 8 }}>Next renewal: {nextRenewal}</p>
    </Card>
  )
}

function License({ handleApplyLicense, handleGetLicense, handleRemoveLicense, clusterName, licenseKey, licenseType, nextRenewal }) {
  return (
    <React.Fragment>
      <h2>License</h2>
      {
        !licenseKey && (
          <React.Fragment>
            <p>Apply a license key to operate Space Cloud in enterprise mode</p>
            <Space size="middle">
              <Button onClick={handleApplyLicense} >Apply license key</Button>
              <Button onClick={handleGetLicense} >Get a license <ArrowUpOutlined rotate={45} /></Button>
            </Space>
          </React.Fragment>
        )
      }
      {
        licenseKey && (
          <React.Fragment>
            <LicenseDetails clusterName={clusterName} licenseKey={licenseKey} licenseType={licenseType} nextRenewal={nextRenewal} />
            <Space size="middle" style={{ marginTop: 16 }}>
              <Button onClick={handleApplyLicense} >Apply a new license key</Button>
              <Button type="danger" onClick={handleRemoveLicense} >Remove license</Button>
            </Space>
          </React.Fragment>
        )
      }
    </React.Fragment>
  )
}

export default License