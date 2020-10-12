import React from 'react';
import { Card, Typography } from 'antd';
import { getGraphQLEndpoints } from '../../../utils';


const EndpointCard = ({ projectId }) => {
	const { httpUrl, websocketUrl } = getGraphQLEndpoints(projectId)

	return (
		<Card style={{ overflow: "auto" }}>
			<Typography.Text strong>HTTP URL:</Typography.Text><Typography.Text copyable ellipsis>{httpUrl}</Typography.Text>
			<br />
			<Typography.Text strong>Websocket URL:</Typography.Text><Typography.Text copyable ellipsis>{websocketUrl}</Typography.Text>
		</Card>
	);
}

export default EndpointCard;