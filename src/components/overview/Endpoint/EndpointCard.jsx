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
		<Card style={{ overflow: "scroll" }}>
			<h3 style={{ wordSpacing: 6 }}><b>HTTP URL: </b>
				<Typography.Paragraph style={{ display: "inline" }} copyable ellipsis>{graphqlHttpURL}</Typography.Paragraph>
			</h3>
			<h3 style={{ wordSpacing: 6 }}><b>Websocket URL: </b>
				<Typography.Paragraph style={{ display: "inline" }} copyable ellipsis>{graphqlWebsocketURL}</Typography.Paragraph>
			</h3>
		</Card>
	);
}

export default EndpointCard;