import React from 'react'
import './service-template.css'
import docker from "../../assets/docker.png";
import python from "../../assets/python.png"
import js from "../../assets/js.png"
import go from "../../assets/go.png"
import {Radio} from "antd";

const ServiceTemplate = (props) => {
  return (
    <div className={
      props.active ? 'service-template active' : 'service-template'
    }>
      <Radio.Button className="deployment-card" value={props.value} style={{padding: 0}}>
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
      </Radio.Button>
    </div>
  )
}

export default ServiceTemplate