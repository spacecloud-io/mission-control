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
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get db-config" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbSchemas(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get db-schema" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadDbRules(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to db-rule" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadEventingConfig(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get eventing-config" : error.msg))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      loadEventingTriggers(projectID)
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get eventing-trigger" : error.msg))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    null
  )
}

export default EventingIndex;
