import React from 'react';
import { Card, Typography } from 'antd';


const EndpointCard = (props) => {

	const { protocol, host, projectId } = props;
	let httpProtocol, wsProtocol;

	if (protocol === "https:") {
		httpProtocol = "https:"
		wsProtocol = "wss:"
	} else {
		httpProtocol = "http:"
		wsProtocol = "ws:"
	}

	const graphqlHttpURL = `${httpProtocol}//${host}/v1/api/${projectId}/graphql`
	const graphqlWebsocketURL = `${wsProtocol}//${host}/v1/api/${projectId}/graphql/socket`

	return (
		<Card style={{ overflow: "auto" }}>
			<Typography.Text strong>HTTP URL:</Typography.Text><Typography.Text copyable ellipsis>{graphqlHttpURL}</Typography.Text>
			<br/>
			<Typography.Text strong>Websocket URL:</Typography.Text><Typography.Text copyable ellipsis>{graphqlWebsocketURL}</Typography.Text>
		</Card>
	);
}

export default EndpointCard;