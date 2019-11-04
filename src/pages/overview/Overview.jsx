import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga';
import '../../index.css'
import './overview.css'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import { message } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Descriptions } from 'antd';

const CopyButton = ({ value }) => {
  return <CopyToClipboard text={value} onCopy={() => message.success("Copied to clipboard!")}>
    <i className="material-icons copy" style={{ cursor: "pointer" }}>content_copy</i>
  </CopyToClipboard>
}
function Overview() {
  const { projectID } = useParams()
  useEffect(() => {
    ReactGA.pageview("/projects/overview");
  }, [])

  const spaceCloudURL = window.location.origin
  const graphqlURL = `${spaceCloudURL}/v1/api/${projectID}/graphql`
  const graphqlWebsocketURL = `${spaceCloudURL}/v1/api/${projectID}/graphql/socket`
  return (
    <div className="overview">
      <Topbar showProjectSelector />
      <Sidenav selectedItem="overview" />
      <div className="page-content ">
        <h3>GraphQL endpoints</h3>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="GraphQL URL" >{graphqlURL}<CopyButton value={graphqlURL} /></Descriptions.Item>
          <Descriptions.Item label="GraphQL Websockets URL">{graphqlWebsocketURL}<CopyButton value={graphqlWebsocketURL} /></Descriptions.Item>
        </Descriptions>
        <h3 style={{ marginTop: 24 }}>Javascript SDK config</h3>
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="Project ID" span={1}>{projectID} <CopyButton value={projectID} /></Descriptions.Item>
          <Descriptions.Item label="Space Cloud URL" span={2} >{spaceCloudURL}<CopyButton value={spaceCloudURL} /></Descriptions.Item>
        </Descriptions>
        <br />
        <h3>Guides</h3>
        <div className="cardContainer">
          <a href="https://docs.spaceuptech.com/getting-started/quick-start/explore-graphql/" target="_blank"><div className="card"><i className="material-icons" id="card">view_carousel</i>Make first DB query</div></a>
          <a href="https://docs.spaceuptech.com/getting-started/setting-up-project/" target="_blank"><div className="card" id="setup"><i className="material-icons" id="card">star_border</i>Setting up client</div></a>
        </div>
      </div>
    </div>
  )
}

export default Overview;
