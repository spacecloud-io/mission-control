import React from 'react';
import { Card, Col, Row, Typography, Button } from 'antd';
import { getGraphQLEndpoints } from '../../../utils';
import { DatabaseOutlined } from '@ant-design/icons';

const styles = {
	card: {
		overflow: "hidden",
		border: "0.3px solid #C4C4C4",
		boxShadow: "-2px -2px 8px rgba(0, 0, 0, 0.15), 2px 2px 8px rgba(0, 0, 0, 0.15)",
		borderRadius: "5px"
	},
	resourceName: {
		color: "#666666",
		fontSize: 18,
		fontWeight: 400
	},
	resourceData: {
		color: "#1E266D",
		fontSize: 32,
		fontWeight: 400
	}
}

const EndpointCard = ({ projectId }) => {
	const { httpUrl, websocketUrl } = getGraphQLEndpoints(projectId)

	return (
		<Card style={styles.card}>
			<Row gutter={100}>
				<Col style={{ borderRight: "0.3px solid #666666" }}>
					<div style={styles.resourceData}><DatabaseOutlined /> 04</div>
					<div style={styles.resourceName}>Databases</div>
				</Col>
				<Col style={{ borderRight: "0.3px solid #666666" }}>
					<div style={styles.resourceData}><DatabaseOutlined /> 14</div>
					<div style={styles.resourceName}>Microservices</div>
				</Col>
				<Col style={{ borderRight: "0.3px solid #666666" }}>
					<div style={styles.resourceData}><DatabaseOutlined /> 06</div>
					<div style={styles.resourceName}>Users</div>
					<Button type="link" size="small" style={{ padding: 0 }}>invite users</Button>
				</Col>
				<Col style={{ alignSelf: "center", lineHeight: "24px" }}>
					<Typography.Text strong>HTTP URL:</Typography.Text><Typography.Text copyable ellipsis>{httpUrl}</Typography.Text>
					<br />
					<Typography.Text strong>Websocket URL:</Typography.Text><Typography.Text copyable ellipsis>{websocketUrl}</Typography.Text>
				</Col>
			</Row>
		</Card>
	);
}

export default EndpointCard;