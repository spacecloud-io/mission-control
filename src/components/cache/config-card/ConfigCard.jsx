import { Button, Badge, Popconfirm, Card } from "antd";
import React from "react";

const ConfigCard = ({ values, disableCache, editConfig }) => {
  const { connected, conn, defaultTTL } = values;
  const isConnSecret = conn && conn.includes("secrets.")
  return (
    <Card bordered style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}>
      <p style={{ marginBottom: 24, fontSize: 16 }}>
        <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={connected ? "green" : "red"} text={connected ? "Connected" : "Disconnected"} /> <br />
        <b style={{ marginRight: 8 }}>Conn:</b> {isConnSecret ? "********************" : conn} <br />
        <b style={{ marginRight: 8 }}>Default TTL:</b> {defaultTTL} seconds
      </p>
      <Button style={{ marginRight: 16 }} onClick={editConfig}>Edit config</Button>
      <Popconfirm
        title="Are you sure you want to disable?"
        onConfirm={disableCache}
      >
        <Button danger>Disable cache</Button>
      </Popconfirm>
    </Card>
  )
}

export default ConfigCard;