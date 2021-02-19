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
        .catch(error => notify("error", error.title, error.msg.length === 0 ? "Failed to get filestore-config" : error.msg))
        .finally(() => decrementPendingRequests())
    }
  }, [projectID])

  return (
    null
  )
}

export default FileStorageIndex;
