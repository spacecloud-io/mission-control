import React, { useEffect } from 'react'
import { useParams, Redirect } from "react-router-dom";

import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { loadServices } from '../../operations/deployments';

const DeploymentsIndex = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadServices(projectID)
        .catch(ex => notify("error", "Error fetching deployments", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    <Redirect to={`/mission-control/projects/${projectID}/deployments/overview`} />
  )
}

export default DeploymentsIndex;
