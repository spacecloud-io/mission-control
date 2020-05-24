import React, { useEffect, useState } from 'react';
import Sidenav from '../../components/sidenav/Sidenav';
import Topbar from '../../components/topbar/Topbar';
import ReactGA from 'react-ga';
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux"
import ProjectPageLayout, { Content, InnerTopBar } from "../../components/project-page-layout/ProjectPageLayout"
import RegisterClusterForm from "../../components/billing/upgrade/RegisterCluster";
import ConflictedClusterIdModal from "../../components/billing/upgrade/ConflictedClusterIdModal";
import { increment, decrement } from 'automate-redux';
import { notify, registerCluster } from '../../utils';

const RegisterCluster = (props) => {

  useEffect(() => {
    ReactGA.pageview("projects/billing/register-cluster");
  }, [])

  const dispatch = useDispatch()
  const history = useHistory();

  const [conflictedClusterName, setConflictedClusterName] = useState(null)

  const handleRegisterCluster = (clusterName, doesExist, onRegisteredCallback) => {
    dispatch(increment("pendingRequests"))
    registerCluster(clusterName, doesExist)
      .then(({ registered, notifiedToCluster, exceptionNotifyingToCluster }) => {
        if (!registered) {
          setConflictedClusterName(clusterName)
          return
        }
        if (onRegisteredCallback) onRegisteredCallback()
        if (!notifiedToCluster) {
          notify("error", "Error registering cluster", exceptionNotifyingToCluster)
          return
        }
        notify("success", "Success", "Successfully registered cluster")
        history.goBack()
      })
      .catch(ex => notify("error", "Error registering cluster", ex))
      .finally(() => dispatch(decrement("pendingRequests")))
  }

  return (
    <React.Fragment>
      <Topbar showProjectSelector />
      <Sidenav selectedItem='billing' />
      <ProjectPageLayout>
        <InnerTopBar title="Register Cluster" />
        <Content>
          <RegisterClusterForm handleRegisterCluster={(clusterName) => handleRegisterCluster(clusterName, false)}/>
          {conflictedClusterName && <ConflictedClusterIdModal
            clusterName={conflictedClusterName}
            handleCancel={() => setConflictedClusterName(null)}
            handleContinue={() => handleRegisterCluster(conflictedClusterName, true, () => setConflictedClusterName(null))}
          />}
        </Content>
      </ProjectPageLayout>
    </React.Fragment>
  );
}

export default RegisterCluster;