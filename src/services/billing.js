import gql from 'graphql-tag';
class Billing {
  constructor(client, spaceSiteClient) {
    this.client = client
    this.spaceSiteClient = spaceSiteClient
  }

  signIn(token) {
    return new Promise((resolve, reject) => {
      // TODO: Put the correct endpoint name
      this.client.query({
        query: gql`
        query {
          login(token: "${token}") @backend {
            status
            error
            message
            result
          }
        }`,
        variables: { token }
      })
        .then(res => {
          const { status, error, message, result } = res.data.login
          if (status !== 200) {
            reject(message)
            console.log("Signin Error", error)
            return
          }
          const { token } = result
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
          create_subscription(name: $name, address: $address, paymentMethodId: $paymentMethodId${invoiceId ? ', invoiceId: $invoiceId' : ''}) @backend{
            status
            error
            message
            result
          }
        }`,
        variables: { name, address, paymentMethodId, invoiceId }
      })
        .then(res => {
          const { status, error, message, result } = res.data.create_subscription
          if (status !== 200) {
            console.log("Set Billing Details Error", error)
            reject(message)
            return
          }

          const subscriptionId = result.id
          const invoiceId = result.latest_invoice.id
          const paymentIntentSecret = result.latest_invoice.client_secret

          const ack = result.status === "active" && result.latest_invoice.payment_intent.status === "succeeded"
          const requiresAction = result.status === "incomplete" && result.latest_invoice.payment_intent.status === "requires_action"

          if (requiresAction) {
            resolve({ ack, requiresAction, invoiceId, subscriptionId, paymentIntentSecret })
          } else {
            resolve({ ack, requiresAction, invoiceId })
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
          create_failed_subscription(subscriptionId: $subscriptionId) @backend {
            status
            error
            message
          }
        }`,
        variables: { subscriptionId }
      })
        .then(res => {
          const { status, error, message } = res.data.create_failed_subscription
          if (status !== 200) {
            console.log("Create failed subscription error", error)
            reject(message)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  registerCluster(clusterName, doesExist) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          register_cluster(clusterName: $clusterName, doesExist: $doesExist) @backend {
            status
            error
            message
            result
          }
        }`,
        variables: { clusterName, doesExist }
      })
        .then(res => {
          const { status, error, message, result } = res.data.register_cluster
          if (status !== 200) {
            console.log("Register Cluster Error", error, "Error Message", message)
            resolve({ ack: false })
            return
          }
          const { clusterId, key } = result
          resolve({ ack: true, clusterId, key })
        })
        .catch(ex => reject(ex))
    })
  }


  setPlan(clusterId, plan) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          update_plan(clusterId: $clusterId, plan: $plan) @backend {
            status
            error
            message
          }
        }`,
        variables: { clusterId, plan }
      })
        .then(res => {
          const { status, error, message } = res.data.update_plan
          if (status !== 200) {
            console.log("Set Plan Error", error)
            reject(message)
            return
          }
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  applyCoupon(couponCode) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          add_promotion(couponCode: $couponCode) @backend {
            status
            error
            message
            result
          }
        }`,
        variables: { couponCode }
      })
        .then(res => {
          const { status, error, message, result } = res.data.add_promotion
          if (status !== 200) {
            console.log("Apply Coupon Error", error)
            reject(message)
            return
          }
          resolve(result.amount)
        })
        .catch(ex => reject(ex))
    })
  }

  fetchBillingDetails() {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          billing_details @backend{
            status
            error
            message
            result
          }
        }`,
        variables: {}
      })
        .then(res => {
          const { status, error, message, result } = res.data.billing_details
          if (status !== 200) {
            console.log("Fetch Billing Details Error", error)
            reject(message)
            return
          }

          const { country, card_number, card_type, card_expiry_date, amount, invoices } = result
          if (!card_number) {
            reject(new Error("Billing is not enabled"))
          }
          const obj = { details: { country, balanceCredits: amount, cardNumber: card_number, cardType: card_type, cardExpiryDate: card_expiry_date }, invoices, amount }
          resolve(obj)
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }

  fetchPlanDetails(plan) {
    return new Promise((resolve, reject) => {
      this.client.query({
        query: gql`
        query {
          plans(id: $plan) @db{
            name
            amount
            quotas
          }
        }`,
        variables: { plan }
      })
        .then(res => {
          if (!res.data.plans || !res.data.plans.length) {
            reject("No such plan")
          }

          const plan = res.data.plans[0]
          resolve(plan)
        })
        .catch(ex => reject(ex))
    })
  }



  contactUs(email, name, subject, msg) {
    return new Promise((resolve, reject) => {
      const body = { email, name, subject, msg }
      this.spaceSiteClient.postJSON("/v1/site/contact-us", body)
        .then(({ status, data }) => {
          if (status !== 200) {
            reject(new Error("Internal server error"))
            return
          }
          if (!data.ack) {
            reject(new Error("Internal server error"))
            return
          }
          
          resolve()
        })
        .catch(ex => reject(ex))
    })
  }
}

export default Billing