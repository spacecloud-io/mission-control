class Billing {
  constructor(client) {
    this.client = client
  }

  setBillingSubscription(paymentMethodId) {
    return new Promise((resolve, reject) => {
      this.client.postJSON(`/v1/billing/basic-plan`, { paymentMethodId: paymentMethodId })
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

  getBillingInvoices() {
    return new Promise((resolve, reject) => {
      this.client.getJSON(`/v1/billing/invoices`)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(data.error)
            return
          }
          resolve(data)
        })
        .catch(ex => reject(ex.toString()))
    })
  }
}

export default Billing