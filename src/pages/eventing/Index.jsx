import { useEffect } from 'react'
import { useParams } from "react-router-dom";
import { useDispatch } from 'react-redux';

import { loadEventingConfig, loadEventingTriggers } from '../../operations/eventing';
import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import databaseActions from "../../actions/database"

const { loadDbConfig, loadDbSchemas, loadDbRules } = databaseActions;

const EventingIndex = () => {
  const { projectID } = useParams()
  const dispatch = useDispatch()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      dispatch(loadDbConfig(projectID))
        .catch(ex => notify("error", "Error fetching database config", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(loadDbSchemas(projectID))
        .catch(ex => notify("error", "Error fetching database schemas", ex))
        .finally(() => decrementPendingRequests())

      incrementPendingRequests()
      dispatch(loadDbRules(projectID))
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
