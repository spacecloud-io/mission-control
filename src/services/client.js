import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

function fetchJSON(origin, url, options) {
  if (origin) {
    url = origin + url
  }
  return new Promise((resolve, reject) => {
    fetch(url, options).then(res => {
      const status = res.status
      res.json().then(data => {
        resolve({ status, data })
      }).catch(ex => {
        reject(ex)
      })
    }).catch(ex => {
      reject(ex)
    })
  })
}

const defaultHeaders = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  }
}

class Client {
  constructor(origin, options) {
    this.origin = origin
    this.options = Object.assign({}, defaultHeaders, options)
  }

  setToken(token) {
    this.options.headers.Authorization = "Bearer " + token;
  }

  getJSON(url) {
    return fetchJSON(this.origin, url, Object.assign({}, this.options, { method: 'GET' }))
  }

  postJSON(url, obj) {
    return fetchJSON(this.origin, url, Object.assign({}, this.options, { method: 'POST', body: JSON.stringify(obj) }))
  }

  delete(url) {
    return fetchJSON(this.origin, url, Object.assign({}, this.options, { method: 'DELETE' }))
  }
  putJSON(url, obj) {
    return fetchJSON(this.origin, url, Object.assign({}, this.options, { method: 'PUT', body: JSON.stringify(obj) }))
  }
}

export function createRESTClient(origin, options) {
  return new Client(origin, options)
}


export function createGraphQLClient(uri, getToken) {
  // Create an http link for GraphQL client:
  const httpLink = new HttpLink({
    uri: uri
  });

  const httpAuthLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = getToken ? getToken() : undefined
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : ""
      }
    }
  });

  const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore'
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }
  }

  // Create a GraphQL client:
  const graphQLClient = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: httpAuthLink.concat(httpLink),
    defaultOptions: defaultOptions
  });

  return graphQLClient
}
