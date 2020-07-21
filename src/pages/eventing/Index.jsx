import { useEffect } from 'react'
import { useParams } from "react-router-dom";

import { loadDbSchemas, loadDbConfig, loadDbRules } from '../../operations/database';
import { loadEventingConfig, loadEventingTriggers } from '../../operations/eventing';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';

const EventingIndex = () => {
  const { projectID } = useParams()


  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadDbConfig(projectID)
        .catch(ex => notify("error", "Error fetching database config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbSchemas(projectID)
        .catch(ex => notify("error", "Error fetching database schemas", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbRules(projectID)
        .catch(ex => notify("error", "Error fetching database rules", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadEventingConfig(projectID)
        .catch(ex => notify("error", "Error fetching eventing config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadEventingTriggers(projectID)
        .catch(ex => notify("error", "Error fetching event triggers", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    null
  )
}

export default EventingIndex;
