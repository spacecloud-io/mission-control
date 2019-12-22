import React from 'react'
import DatabaseCard from './DatabaseCard'
import { Row } from "antd"

function DatabaseCardList(props) {

  return (
    <Row gutter={32}>
      {props.cards.map((card) =>
        <DatabaseCard key={card.key} name={card.name} desc={card.desc} graphics={card.graphics} handleEnable={() => props.handleEnable(card.key)} />)}
    </Row>
  )
}

export default DatabaseCardList