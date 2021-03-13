import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { getGraphQLEndpoints } from '../../../utils';
import { DatabaseOutlined } from '@ant-design/icons';

const cardStyles = {
	overflow: "hidden",
	border: "0.3px solid #C4C4C4",
	boxShadow: "-2px -2px 8px rgba(0, 0, 0, 0.15), 2px 2px 8px rgba(0, 0, 0, 0.15)",
	borderRadius: "5px"
}


const EndpointCard = ({ projectId }) => {
	const { httpUrl, websocketUrl } = getGraphQLEndpoints(projectId)

	return (
		<Card style={cardStyles}>
			<Row gutter={100}>
				<Col style={{ borderRight: "0.3px solid darkgrey" }}>
					<h1 style={{ margin: 0, padding: 0 }}><DatabaseOutlined /> 04</h1>
					<h3 style={{ margin: 0, padding: 0, color: "darkgrey" }}>Databases</h3>
				</Col>
				<Col style={{ borderRight: "0.3px solid darkgrey" }}>
					<h1 style={{ margin: 0, padding: 0 }}><DatabaseOutlined /> 14</h1>
					<h3 style={{ margin: 0, padding: 0, color: "darkgrey" }}>Microservices</h3>
				</Col>
				<Col style={{ borderRight: "0.3px solid darkgrey" }}>
					<h1 style={{ margin: 0, padding: 0 }}><DatabaseOutlined /> 06</h1>
					<h3 style={{ margin: 0, padding: 0, color: "darkgrey" }}>Users</h3>
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