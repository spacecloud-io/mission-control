import Service from "./services/service";
import { getToken } from "./operations/cluster";

const service = new Service(getToken())
export default service