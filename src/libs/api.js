import Db from './db'

class API {
  constructor () {
    this.endpoint = "http://38.106.21.94:1980/api/v1"
  }

  save_word(word) {
    let payload = { word }
    let headers = this.build_headers()

    return fetch(`${this.endpoint}/words`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(response => {
      let rtn = {
        success: false,
        message: 'Save failed'
      }

      if (response && !!response.success) {
        rtn = {
          success: true,
          message: 'Save success'
        }
      }
      return rtn
    })
  }

  login(email, password) {
    let payload = {
      email: email,
      password: password
    }
    let headers = this.build_headers()

    return fetch(`${this.endpoint}/login`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(response => {
      let rtn = {
        success: false,
        message: 'Login failed'
      }

      if (response && response.data && response.data.token) {
        Db.save_account({
          email,
          token: response.data.token
        })
        rtn = {
          success: true,
          message: 'Login success'
        }
      }
      return rtn
    })
  }

  build_headers() {
    let headers = {
      'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      'Content-Type': 'application/json'
    }

    if (Db.account) {
      headers['Authorization'] = `bearer ${Db.account.token}`
    }
    return headers
  }

}

export default new API()

