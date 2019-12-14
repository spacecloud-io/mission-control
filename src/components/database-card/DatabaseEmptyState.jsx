import React from 'react'
import { Row, Button, Col } from "antd"
import './database-card.css'
import addDb from '../../assets/addDb.svg'
import history from '../../history'
import {useParams} from 'react-router-dom'

function DatabaseEmptyState() {
  const {projectID} = useParams()
  return (
    <div>
      <Row>
        <Col lg={{offset:5 }}>
          <img src={addDb} alt="add database" />
          <p>Space Cloud exposes realtime GraphQL and REST APIs on top of new or existing databases. Add a database to get started.</p>
        </Col>
      </Row>
      <Row gutter={32}>
        <Col lg={{span: 8, offset: 10}}>
          <Button type="primary" className="add-db" onClick={() => history.push(`/mission-control/projects/${projectID}/database/add-db`)}>Add Database</Button>
        </Col>
      </Row>
    </div>
  )
}

export default DatabaseEmptyState