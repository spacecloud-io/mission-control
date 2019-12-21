import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import ReactGA from 'react-ga';
import { Row, Col } from 'antd'

import SignUpForm from './SignUpForm';
import client from '../../client';
import { notify, handleConfigLogin } from "../../utils"

import './sign-up.css'
import logo from '../../assets/logo-black.svg'
import loginBg from '../../assets/login.svg'
import github from '../../assets/login-github.svg'
import google from '../../assets/login-google.svg'
import fb from '../../assets/login-fb.svg'

import githubM from '../../assets/githubM.svg'
import googleM from '../../assets/googleM.svg'
import fbM from '../../assets/facebookM.svg'

const SignUp = () => {
  const isLoading = useSelector(state => state.pendingRequests > 0)
  const handleSubmit = (user, pass) => {
    client.login(user, pass).then(token => {
      localStorage.setItem("token", token)
      handleConfigLogin(token)
    }).catch(ex => notify("error", "Error logging in", ex))
  }
  useEffect(() => {
    ReactGA.pageview("/");
  }, [])
  return (
    <div className="sign-up">
      <div className="main-wrapper">
        <Row className="row">
          <Col span={12} className="left-wrapper">
            <div className="left-content">
              <img className="logo" src={logo} alt="logo" /><br />
              <div className="welcome">Welcome back!</div>
              <div className="text">Login to configure your Space Cloud cluster.</div><br />
              <img src={loginBg} alt="login" height="240" width="360" /><br />
            </div>
          </Col>

          <Col span={12} className="right-wrapper">
            <div className="right-content">
              <div class="sign-up">
                <span>Already have an account? </span>
                <a href=""> Sign in here</a>
              </div>
              <SignUpForm isLoading={isLoading} handleSubmit={handleSubmit} />
              <div class="divider">
                <hr></hr>
                <span class="or">OR</span>
                <hr></hr>
              </div>
              <div class="sign-up-with">
                <a href=""><img src={google} alt="google" width="40px" style={{ margin: 24 }} /></a>
                <a href=""><img src={github} alt="github" width="40px" style={{ margin: 24 }} /></a>
                <a href=""><img src={fb} alt="facebook" width="40px" style={{ margin: 24 }} /></a>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <center>
        <div class="sign-up-mobile-view">
          <img className="logo" src={logo} alt="logo" />
          <SignUpForm isLoading={isLoading} handleSubmit={handleSubmit} />
          <div class="divider">
            <hr></hr>
            <span class="or">OR</span>
            <hr></hr>
          </div>
          <div class="sign-up-with">
            <a href=""><img src={googleM} alt="google" width="35px" style={{ margin: 16 }} /></a>
            <a href=""><img src={githubM} alt="github" width="35px" style={{ margin: 16 }} /></a>
            <a href=""><img src={fbM} alt="facebook" width="35px" style={{ margin: 16 }} /></a>
          </div>
        </div>
      </center>
    </div>
  )
}

export default SignUp
