import { useEffect } from 'react'
import { useParams } from "react-router-dom";

import { loadSecrets } from '../../operations/secrets';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

const SecretsIndex = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadSecrets(projectID)
        .catch(ex => notify("error", "Error fetching secrets", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    null
  )
}

export default SecretsIndex;
