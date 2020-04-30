const fetchJSON = (origin, url, options) => {
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


class Client {
  constructor(origin) {
    this.origin = origin
    this.options = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    }
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
  putJSON(url, obj){
    return fetchJSON(this.origin, url, Object.assign({}, this.options, { method: 'PUT', body: JSON.stringify(obj) }))
  }
}

export default Client
