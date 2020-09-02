import { createRESTClient } from "../services/client";
import { spaceCloudClusterOrigin } from "../constants";

export const scClient = createRESTClient(spaceCloudClusterOrigin)

