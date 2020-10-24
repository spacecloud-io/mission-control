import React from 'react'
import { useSelector } from 'react-redux'
import { Row, Col } from 'antd'

import LoginForm from './LoginForm';
import { notify, incrementPendingRequests, decrementPendingRequests, performActionsOnAuthenticated } from "../../utils"

import './login.css'
import logo from '../../assets/logo-black.svg'
import loginBg from '../../assets/login.svg'
import { login } from '../../operations/cluster';

const Login = () => {
  const isLoading = useSelector(state => state.pendingRequests > 0)
  const handleSubmit = (user, key) => {
    incrementPendingRequests()
    login(user, key)
      .then(() => {
        notify("success", "Success", "Logged in successfully")

        // This fetches projects and either opens a project or redirects to welcome page accordingly
        performActionsOnAuthenticated()
      })
      .catch(ex => notify("error", "Error logging in", ex))
      .finally(() => decrementPendingRequests())
  }

  return (
    <div className="login">
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
              <LoginForm isLoading={isLoading} handleSubmit={handleSubmit} />
            </div>
          </Col>
        </Row>
      </div>


      <div className="mobile-view">
        <img className="logo" src={logo} alt="logo" /><br />
        <div className="welcome">Welcome back!</div>
        <div className="text">Login to configure your Space Cloud cluster.</div><br />
        <LoginForm isLoading={isLoading} handleSubmit={handleSubmit} />
      </div>
    </div>
  )
}

export default Login
