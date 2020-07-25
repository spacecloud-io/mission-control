import { useEffect } from 'react'
import { useParams } from "react-router-dom";

import { notify, incrementPendingRequests, decrementPendingRequests } from '../../utils';
import { loadFileStoreConfig } from '../../operations/fileStore';

const FileStorageIndex = () => {
  const { projectID } = useParams()

  useEffect(() => {
    if (projectID) {
      incrementPendingRequests()
      loadFileStoreConfig(projectID)
        .catch(ex => notify("error", "Error fetching file storage config", ex))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    null
  )
}

export default FileStorageIndex;
