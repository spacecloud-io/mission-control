import Service from "./services/service";
import { getToken, getSpaceUpToken } from "./utils"

const service = new Service(getToken(), getSpaceUpToken())
export default service