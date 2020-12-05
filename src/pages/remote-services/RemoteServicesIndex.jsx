import { useEffect } from 'react'
import { useParams } from "react-router-dom";

import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { loadRemoteServices } from '../../operations/remoteServices';
import { loadCacheConfig } from "../../operations/cache";

const RemoteServicesIndex = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadRemoteServices(projectID)
        .catch(ex => notify("error", "Error fetching remote services", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  useEffect(() => {
    incrementPendingRequests()
    loadCacheConfig()
      .finally(() => decrementPendingRequests())
  }, [])

  return (
    null
  )
}

export default RemoteServicesIndex;
