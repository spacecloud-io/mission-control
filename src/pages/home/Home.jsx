import React from "react"
import "./home.css"
import SpaceUpLogo from "../../assets/logo.svg"

export default ({ loadingPage }) => {
  return (
    <div className="home">
      <div className="content">
        <span className="title">Welcome to Mission Control!</span>
        <br />
        <img src={SpaceUpLogo} alt="" className="loading-logo" />
        <br />
        <span>Loading {loadingPage ? "page" : "data"}...</span>
      </div>
    </div>
  )
}