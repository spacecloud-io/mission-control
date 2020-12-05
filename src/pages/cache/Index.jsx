import { useEffect } from 'react'
import { loadCacheConfig } from '../../operations/cache';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

const CacheIndex = () => {

  useEffect(() => {
    incrementPendingRequests()
    loadCacheConfig()
      .catch(ex => notify("error", "Error loading cache config", ex))
      .finally(() => decrementPendingRequests())
  }, [])

  return (
    null
  )
}

export default CacheIndex;
