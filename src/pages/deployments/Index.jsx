import { useEffect } from 'react'
import { useParams } from "react-router-dom";

import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { loadServices } from '../../operations/deployments';
import { loadSecrets } from '../../operations/secrets';

const DeploymentsIndex = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecrets(projectID)
        .catch(ex => notify("error", "Error fetching secrets", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadServices(projectID)
        .catch(ex => notify("error", "Error fetching deployments", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return null
}

export default DeploymentsIndex;
