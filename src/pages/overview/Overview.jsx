import React, { useEffect } from 'react'
import ReactGA from 'react-ga';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import '../../index.css'
import './overview.css'
import '../../components/card-modules/cards.css'
import Sidenav from '../../components/sidenav/Sidenav'
import Topbar from '../../components/topbar/Topbar'
import Header from '../../components/header/Header'
import js from '../../assets/js.svg'
import go from '../../assets/go.svg'
import { Row, Col, Button } from 'antd'
import { get } from 'automate-redux';
import { Descriptions } from 'antd';


function Overview(props) {
  useEffect(() => {
    ReactGA.pageview("/projects/overview");
  }, [])
  
  return (
    <div className="overview">
      <Topbar showProjectSelector />
      <div className="flex-box">
        <Sidenav selectedItem="overview" />
        <div className="page-content ">
          {/*<Row>
            <Col span={9}>
              <Header name="Get started with Space Cloud" color="#000" fontSize="22px" />
            </Col>
          </Row>
          <div>
            <p>Start with one of the client specific getting started guides below or explore the powers of Space Cloud via in-built Explorer.</p>
            <div className="lang">
              <a href="https://docs.spaceuptech.com/getting-started/setting-up-project/javascript" target="_blank" rel="noopener noreferrer">
                <span class="circle"><img src={js} alt="js" /></span>
              </a>
              <a href="https://docs.spaceuptech.com/getting-started/setting-up-project/golang" target="_blank" rel="noopener noreferrer">
                <span class="circle" id="go"><img src={go} alt="go" /></span>
              </a>
              <div className="sepration"></div>
              <a href="https://docs.spaceuptech.com/getting-started/quick-start/explore-graphql" target="_blank" rel="noopener noreferrer">
                <Button type="primary" shape="round" icon="read" size="large" className="get-started">Explore GraphQL APIs</Button>
              </a>
            </div>
          </div>*/}
          <h2>Client Details</h2>
          <Descriptions bordered column={{ xxl: 4, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Project ID">{props.projectId}<i className="material-icons copy">content_copy</i></Descriptions.Item>
            <Descriptions.Item label="SC URL">{props.URL}<i className="material-icons copy">content_copy</i></Descriptions.Item>
          </Descriptions><br/><br/>
         <h2>Guides</h2>
          <div className="cardContainer">
              <a href="https://docs.spaceuptech.com/getting-started/quick-start/explore-graphql/" target="_blank"><div className="card"><i className="material-icons" id="card">view_carousel</i>Make first DB query</div></a>
              <a href="https://docs.spaceuptech.com/getting-started/setting-up-project/" target="_blank"><div className="card" id="setup"><i className="material-icons"id="card">star_border</i>Setting up client</div></a>
             {/*<div className="card">Troubleshooting</div>*/}
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    projectId: ownProps.match.params.projectId,
    URL:"https://localhost:4122",
    modules: {
      userManagement: {
        enabled: get(state, "config.modules.auth.enabled", false),
        email: get(state, "config.modules.auth.email.enabled", false),
        google: get(state, "config.modules.auth.google.enabled", false),
        fb: get(state, "config.modules.auth.fb.enabled", false),
        twitter: get(state, "config.modules.twitter.email.enabled", false),
        github: get(state, "config.modules.auth.github.enabled", false),
      },
      database: {
        enabled: true,
        mysql: get(state, `config.modules.crud.sql-mysql.enabled`, false),
        postgres: get(state, `config.modules.crud.sql-postgres.enabled`, false),
        mongo: get(state, `config.modules.crud.mongo.enabled`, false),
      },
      functions: {
        enabled: get(state, `config.modules.functions.enabled`, false),
      },
      configure: {
        enabled: true,
      },
    }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
