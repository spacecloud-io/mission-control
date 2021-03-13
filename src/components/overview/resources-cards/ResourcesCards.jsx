import React from 'react';
import { Card, Col, Row, Select, Button } from 'antd';
import "./resources-cards.css";

const styles = {
    card: {
        overflow: "hidden",
        border: "0.3px solid #C4C4C4",
        boxShadow: "-2px -2px 8px rgba(0, 0, 0, 0.15), 2px 2px 8px rgba(0, 0, 0, 0.15)",
        borderRadius: "5px"
    },
    resourceName: {
        color: "#333333",
        fontSize: 18,
        fontWeight: 400
    },
    resourceData: {
        color: "#1E266D",
        fontSize: 32,
        fontWeight: 400
    }
}

const ResourcesCards = () => {

    return (
        <Row gutter={[32, 16]} style={{ marginTop: 24 }}>
            <Col xl={8} sm={24}>
                <Card style={styles.card}>
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 18, color: "#333333" }}>API requests handled</span>
                        <Select className="resource-since" defaultValue="1">
                            <Select.Option value="1">last 2 hr</Select.Option>
                        </Select>
                    </div>
                    <Row>
                        <Col style={{ paddingRight: 32, borderRight: "0.3px solid #666666" }}>
                            <div style={styles.resourceData}>32</div>
                            <div style={styles.resourceName}>Ingress</div>
                        </Col>
                        <Col style={{ paddingLeft: 32 }}>
                            <div style={styles.resourceData}>18</div>
                            <div style={styles.resourceName}>GraphQL</div>
                        </Col>
                    </Row>
                </Card>
            </Col>
            <Col xl={6} sm={24}>
                <Card style={styles.card}>
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ fontSize: 18, color: "#333333" }}>Error Rate</span>
                        <Select className="resource-since" defaultValue="1">
                            <Select.Option value="1">last 2 hr</Select.Option>
                        </Select>
                    </div>
                    <div style={styles.resourceData}>03</div>
                    <div style={styles.resourceName}>Errors</div>
                </Card>
            </Col>
            <Col xl={10} sm={24}>
                <Card style={{ height: "100%" }}>
                    <div style={{ fontSize: 14, marginBottom: 8 }}><b>Billable resources of Pegasis</b></div>
                    <Row>
                        <Col span={12} style={{ borderRight: "0.3px solid #666666" }}>
                            <p style={{ marginBottom: 0, lineHeight: "24px" }}>
                                Database: 4 <br />
                                RAM: 4GB <br />
                                Server space: 6GB <br />
                            </p>
                        </Col>
                        <Col span={12}>
                            <p style={{ marginBottom: 0, lineHeight: "24px", marginLeft: 24 }}>
                                Estimated Billing this month <br />
                                <span style={{ fontSize: 18 }}>$ 18.3</span>
                                <Button type="link">View details</Button>
                            </p>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
}

export default ResourcesCards;