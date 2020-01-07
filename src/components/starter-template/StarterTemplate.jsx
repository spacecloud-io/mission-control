import React from 'react'
import './starter-template.css'
import star from '../../assets/star.svg'

const StarterTemplate = (props) => {
  return (
    <div onClick={props.onClick} className={
      props.active ? 'template active' : 'template'
    }>
      <div className="top">
        <img src={props.icon} alt={props.heading} height="35" width="30" />
        <span className="heading">{props.heading}</span>
        {props.active &&
          <i className="material-icons selected">check_circle</i>
        }
      </div>
      <p className="desc">{props.desc}</p>
      <p className="ybdb">( <img src={props.dbicon} alt={props.heading} height="25" width="25" /> <span>{props.db}</span> )</p>
      {(props.recommended) &&
        <span className="recommend-footer">
          <span className="recommend">Recommended</span>
          <img src={star} alt="recommended" height="17" width="17" />
        </span>
      }
    </div>
  )
}

export default StarterTemplate
