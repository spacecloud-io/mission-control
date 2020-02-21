import React,{useState} from 'react';
import { Card, message } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';


const EndpointCard = (props) => {

    const [httpCopy, setHttpCopy] = useState("copy")
    const [wsCopy, setWsCopy] = useState("copy")
    const { protocol, host, projectId } = props;
    let httpProtocol, wsProtocol;

    if(protocol === "https:"){
        httpProtocol = "https:"
        wsProtocol = "wss:"
    }else{
        httpProtocol = "http:"
        wsProtocol = "ws:"
    }

    const graphqlHttpURL = `${httpProtocol}//${host}/v1/api/${projectId}/graphql`
    const graphqlWebsocketURL = `${wsProtocol}//${host}/v1/api/${projectId}/graphql/socket`
  
    const copyValue = (e, text) => {
        e.preventDefault();
        if (text === "http") {
            setWsCopy("copy");
            setHttpCopy("copied");
            setTimeout(() => setHttpCopy("copy"), 5000);
        } else {
            setHttpCopy("copy")
            setWsCopy("copied");
            setTimeout(() => setWsCopy("copy"), 5000);
        }
    }

    return (
        <Card style={{ overflow:"scroll" }}>
            <h3 style={{ wordSpacing: 6 }}><b>HTTP URL: </b>
                <a style={{ color:"rgba(0,0,0, 0.85)" }} onClick={(e) => copyValue(e, "http")}>{graphqlHttpURL}</a> <CopyToClipboard text={props.http}>
                    <a onClick={(e) => copyValue(e, "http")}>{httpCopy}</a>
                </CopyToClipboard></h3>
            <h3 style={{ wordSpacing: 6 }}><b>Websocket URL: </b> 
                <a style={{ color:"rgba(0,0,0, 0.85)" }} onClick={(e) => copyValue(e, "ws")}>{graphqlWebsocketURL}</a> <CopyToClipboard text={props.ws}>
                    <a onClick={(e) => copyValue(e, "ws")} >{wsCopy}</a>
                </CopyToClipboard></h3>
        </Card>
    );
}

export default EndpointCard;