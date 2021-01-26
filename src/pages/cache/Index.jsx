import { useEffect } from 'react'
import { loadCacheConfig } from '../../operations/cache';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

const CacheIndex = () => {

  useEffect(() => {
    incrementPendingRequests()
    loadCacheConfig()
      .catch((error) => notify("error", error.title, error.msg.length === 0 ? "Failed to get cache-config": error.msg))
      .finally(() => decrementPendingRequests())
  }, [])

  return (
    null
  )
}

export default CacheIndex;
