import React from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import queryString from 'query-string'
import { getFirebaseToken, notify, enterpriseSignin } from '../../utils';
import history from "../../history"

const handleVerifyEmail = (actionCode) => {
  firebase.auth().applyActionCode(actionCode).then(function(resp) {
    localStorage.setItem("isEmailVerified", "true")
    notify("success", "Success", "Verified email successfully")
    const token = getFirebaseToken()
    if (!token) {
      history.push("/mission-control/signin")
      return
    }
    
    enterpriseSignin(token).catch(ex => notify("error", "Signin failed", ex.toString()))
  }).catch(function(error) {
    notify("error", "Error verifying email", error.toString())
  });
}

const EmailActionHandler = (props) => {
  const { mode, oobCode } = queryString.parse(props.location.search)

  switch (mode) {
    case 'verifyEmail':
      // Display email verification handler and UI.
      setTimeout(() => handleVerifyEmail(oobCode), 5000)
      return <div>Verifying your email...</div>
    default:
    // Error: invalid mode.
  }

  return null
}

export default EmailActionHandler;