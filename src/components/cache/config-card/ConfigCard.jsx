import { Button, Badge, Popconfirm } from "antd";
import React from "react";
import "./config-card.css";

const ConfigCard = ({ values, disableCache, editConfig }) => {
    const { connected, conn } = values;

    return (
        <div className="config-card">
            <p style={{ marginBottom: 24, fontSize: 16 }}>
                <b style={{ marginRight: 8 }}>Status:</b> <Badge status="processing" text="Running" color={connected ? "green" : "red"} text={connected ? "Connected" : "Disconnected"} /> <br />
                <b style={{ marginRight: 8 }}>Conn:</b> {conn} <br />
            </p>
            <Button style={{ marginRight: 16 }} onClick={editConfig}>Edit config</Button>
            <Popconfirm
             title="Are you sure you want to disable?"
             onConfirm={disableCache}
            >
                <Button className="disable-btn">Disable cache</Button>
            </Popconfirm>
        </div>
    )
}

export default ConfigCard;