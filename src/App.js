import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { Spin } from "antd"
import SigninModal from "./components/signup/signin-modal/SigninModal"
import Routes from './Routes';
import { set, increment, decrement } from 'automate-redux';
import { notify, enterpriseSignin } from './utils';

function App() {
  const dispatch = useDispatch()
  const pendingRequests = useSelector(state => state.pendingRequests)
  const showSigninModal = useSelector(state => state.uiState.showSigninModal)
  const loading = pendingRequests > 0 ? true : false

  function handleSigninModalCancel() {
    dispatch(set("uiState.showSigninModal", false))
  }

  function handleSignin(firebaseToken) {
    dispatch(increment("pendingRequests"))
    enterpriseSignin(firebaseToken)
      .then(() => {
        handleSigninModalCancel()
        notify("success", "Success", "You have signed in successfully")
      })
      .catch(ex => notify("error", "Error in signin", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  return (
    <div>
      <Routes />
      {loading && <Spin spinning={true} size="large" />}
      {showSigninModal && <SigninModal handleCancel={handleSigninModalCancel} handleSignin={handleSignin} />}
    </div>
  );
}

export default App;
