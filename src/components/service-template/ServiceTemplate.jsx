import React from 'react'
import './service-template.css'
import yugabyte from '../../assets/yugabyte-logo.png'

const StarterTemplate = (props) => {
  return (
    <div onClick={props.onClick} className={
      props.active ? 'template active' : 'template'
    }>
      <div className="top">
        <img src={props.icon} alt={props.heading} height="24" width="25" />
        <span className="heading">{props.heading}</span>
        {props.active &&
          <i className="material-icons selected">check_circle</i>
        }
        <br />
        {props.heading === "PostgreSQL" && (
          <p className="desc">( <img src={yugabyte} alt="yugabyte" /> Yugabyte DB )</p>
        )}
        {props.heading === "Space Cloud" && (
          <p className="desc-space">(  Yugabyte DB )</p>
        )}
      </div>
    </div>
  )
}

export default StarterTemplate
