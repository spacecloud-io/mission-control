class Billing {
  constructor(client) {
    this.client = client
  }

  signIn(token) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/login", { token })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          if (!data.token) {
            reject(new Error("Token not provided"))
            return
          }
          resolve(data.token)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  setBillingDetails(name, address, paymentMethodId, invoiceId) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/billing/subscription/create", { name, address, paymentMethodId, invoiceId })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }

          const subscriptionId = data.id
          const invoiceId = data.latest_invoice.id
          const paymentIntentSecret = data.latest_invoice.client_secret

          const ack = data.status === "active" && data.latest_invoice.payment_intent.status === "succeeded"
          const requiresAction = data.status === "incomplete" && data.latest_invoice.payment_intent.status === "requires_action" 

          if (requiresAction) {
            resolve(ack, requiresAction, invoiceId, subscriptionId, paymentIntentSecret)
          } else {
            resolve(ack, requiresAction, invoiceId)
          }
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  handle3DSecureSuccess(subscriptionId) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/billing/subscription/create-failed", { subscriptionId })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  registerCluster(clusterId, doesExist = false) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/register-cluster?doesExist=${doesExist}`, { clusterId })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }


  setPlan(clusterId, plan) {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/billing/subscription/update", { clusterId, plan })
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex.toString()))
    })
  }

  fetchBillingDetails() {
    return new Promise((resolve, reject) => {
      this.client.postJSON("/v1/billing/details")
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          const { country, card_number, card_type, card_expiry_date, amount, invoices } = data
          if (!card_number) {
            reject(new Error("Billing is not enabled"))
          }
          const result = { details: { country, balanceCredits: amount, cardNumber: card_number, cardType: card_type, cardExpiryDate: card_expiry_date }, invoices }
          resolve(result)
        })
        .catch(ex => reject(ex.toString()))
    })
  }


  contactUs(email, name, subject, msg) {
    return new Promise((resolve, reject) => {
      const body = { source: "Space Cloud Enterprise", email, name, subject, msg }
      this.client.postJSON(`/v1/site/contact-us`, body)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(status)
        })
        .catch(ex => reject(ex.toString()))
    })
  }

}

export default Billing