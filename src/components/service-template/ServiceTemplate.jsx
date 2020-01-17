import React from 'react'
import './service-template.css'
import docker from "../../assets/docker.png";
import python from "../../assets/python.png"
import js from "../../assets/js.png"
import go from "../../assets/go.png"

const ServiceTemplate = (props) => {
  return (
    <div className={
      props.active ? 'service-template active' : 'service-template'
    }>
      <div className="top">
          <div>
        <span className="heading">{props.heading}</span>
        {props.active && <i className="material-icons selected">check_circle</i>}
        </div>
        {props.heading === "Non dockerized code" && (
            <div className="desc">
          <p>Space cloud will build and run your app inside docker containers</p>
          <img src={python} className="icon" alt="python.png" />
          <img src={js} className="icon" alt="js.png" />
          <img src={go} className="icon" alt="go.png" />
          </div>
        )}
        {props.heading === "Docker container" && (
            <div className="desc">
          <p>Space cloud will directly the container image you provide</p>
          <img src={docker} className="icon" alt="docker.png" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceTemplate