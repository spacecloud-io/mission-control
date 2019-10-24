import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga';
import '../../index.css'
import './overview.css'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import { Row, Col, Button } from 'antd'
import { Descriptions } from 'antd';


function Overview() {
  const { projectId } = useParams()
  useEffect(() => {
    ReactGA.pageview("/projects/overview");
  }, [])

  return (
    <div className="overview">
      <Topbar showProjectSelector />
      <div className="flex-box">
        <Sidenav selectedItem="overview" />
        <div className="page-content ">
          <h2>Client Details</h2>
          <Descriptions bordered column={{ xxl: 4, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Project ID">{projectId}<i className="material-icons copy">content_copy</i></Descriptions.Item>
            <Descriptions.Item label="SC URL">{window.location.origin}<i className="material-icons copy">content_copy</i></Descriptions.Item>
          </Descriptions><br /><br />
          <h2>Guides</h2>
          <div className="cardContainer">
            <a href="https://docs.spaceuptech.com/getting-started/quick-start/explore-graphql/" target="_blank"><div className="card"><i className="material-icons" id="card">view_carousel</i>Make first DB query</div></a>
            <a href="https://docs.spaceuptech.com/getting-started/setting-up-project/" target="_blank"><div className="card" id="setup"><i className="material-icons" id="card">star_border</i>Setting up client</div></a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview;
