import { useEffect } from 'react'
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { loadSupportedIntegrations, loadInstalledIntegrations } from '../../operations/integrations';

const IntegrationIndex = () => {

  useEffect(() => {
    incrementPendingRequests()
    loadSupportedIntegrations()
      .catch(ex => notify("error", "Error fetching supported integrations", ex))
      .finally(() => decrementPendingRequests())

    incrementPendingRequests()
    loadInstalledIntegrations()
      .catch(ex => notify("error", "Error fetching installed integrations", ex))
      .finally(() => decrementPendingRequests())
  }, [])

  return null
}

export default IntegrationIndex;
