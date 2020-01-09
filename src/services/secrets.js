import store from "../store"
import { increment, decrement } from "automate-redux"

class Secrets {
  constructor(client) {
    this.client = client
  }
}

export default Secrets;