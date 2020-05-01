import gql from 'graphql-tag';
class Billing {
  constructor(client) {
    this.client = client
  }

  signIn(token) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          login(token: $token) {
            status
            error
            token
          }
        }`,
        variables: { token }
      })
        .then(result => {
          const { status, error, token } = result.data.login
          if (status !== 200) {
            reject(error)
            return
          }
          if (!token) {
            reject(new Error("Token not provided"))
            return
          }
          resolve(token)
        })
        .catch(ex => reject(ex))
    })
  }

  setBillingDetails(name, address, paymentMethodId, invoiceId) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          create_subscription(name: $name, address: $address, paymentMethodId: $paymentMethodId${invoiceId ? ', invoiceId: $invoiceId' : ''}) {
            status
            error
            data
          }
        }`,
        variables: { name, address, paymentMethodId, invoiceId }
      })
        .then(result => {
          const { status, error, data } = result.data.login
          if (status !== 200) {
            reject(error)
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
        .catch(ex => reject(ex))
    })
  }

  handle3DSecureSuccess(subscriptionId) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          update_subscription(subscriptionId: $subscriptionId) {
            status
            error
          }
        }`,
        variables: { subscriptionId }
      })
        .then(result => {
          const { status, error } = result.data.login
          if (status !== 200) {
            reject(error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  registerCluster(clusterId, doesExist) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          register_cluster(clusterId: $clusterId, doesExist: $doesExist) {
            status
            error
            key
          }
        }`,
        variables: { clusterId, doesExist }
      })
        .then(result => {
          const { status, key } = result.data.login
          if (status !== 200) {
            resolve(false)
            return
          }
          resolve(true, key)
        })
        .catch(ex => reject(ex))
    })
  }


  setPlan(clusterId, plan) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          update_subscription(clusterId: $clusterId, plan: $plan) {
            status
            error
          }
        }`,
        variables: { clusterId, plan }
      })
        .then(result => {
          const { status, error } = result.data.login
          if (status !== 200) {
            reject(error)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  fetchBillingDetails() {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          billing_details {
            status
            error
            data
          }
        }`,
        variables: {}
      })
        .then(result => {
          const { status, error, data } = result.data.login
          if (status !== 200) {
            reject(error)
            return
          }

          const { country, card_number, card_type, card_expiry_date, amount, invoices } = data
          if (!card_number) {
            reject(new Error("Billing is not enabled"))
          }
          const obj = { details: { country, balanceCredits: amount, cardNumber: card_number, cardType: card_type, cardExpiryDate: card_expiry_date }, invoices }
          resolve(obj)
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }


  contactUs(email, name, subject, msg) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          contact_us(source: "Space Cloud Enterprise", email: $email, subject: $subject, msg: $msg${name ? ", name: $name" : ""}) {
            status
            error
            data
          }
        }`,
        variables: { email, name, subject, msg }
      })
        .then(result => {
          const { status, error, data } = result.data.login
          if (status !== 200) {
            reject(error)
            return
          }

          resolve()
        })
        .catch(ex => reject(ex))
    })
  }
}

export default Billing