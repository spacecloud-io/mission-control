import { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { loadCacheConfig } from '../../operations/cache';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

const CacheIndex = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadCacheConfig(projectID)
        .catch(ex => notify("error", "Error loading cache config", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    null
  )
}

export default CacheIndex;
