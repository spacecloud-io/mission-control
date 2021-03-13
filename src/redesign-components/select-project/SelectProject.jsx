import React from "react";
import { Button, Drawer, Row, Col, Table } from "antd";
import "./select-project.css";

const SelectProject = ({ onClose }) => {

    const columns = [
        {
            title: "Project Name",
            key: "name",
            dataIndex: "name"
        },
        {
            title: "Region",
            key: "region",
            dataIndex: "region"
        },
        {
            title: "URL",
            key: "url",
            dataIndex: "url"
        },
        {
            title: "Users",
            key: "users",
            dataIndex: "users"
        },
        {
            key: "actions",
            render: (_, record) => <Button>Select</Button>
        }
    ]

    const data = [
        {
            name: "Pegasis",
            region: "Atlanta",
            url: "http://68.183.81.238/v1/pegasis",
            users: "06"
        },
        {
            name: "Compass",
            region: "Atlanta",
            url: "http://68.183.81.238/v1/pegasis",
            users: "07"
        }
    ]
    return (
        <Drawer
            style={{ marginTop: 64 }}
            placement="top"
            closable={true}
            onClose={onClose}
            visible={true}
            key="1"
            mask={false}
        >
            <Row>
                <Col offset={1} span={17} style={{ borderRight: "0.3px solid #333333" }}>
                    <Table
                        className="project-selection-table"
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        size="middle"
                    />
                </Col>
                <Col span={6} style={{ alignSelf: "center", textAlign: "center" }}>
                    <Button type="primary" size="large">Create New Project</Button>
                </Col>
            </Row>
        </Drawer>
    )
}

export default SelectProject