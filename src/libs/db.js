class Db {
  constructor () {
    // console.log("db init")
    this.zoomPercents = {}
    this.account = null
    chrome.storage.sync.get(['zoomPercents'], (result) => {
      console.log('zoomPercents result', result)
      if (result.db) {
        this.zoomPercents = result.db.zoomPercents || {}
      }
    });
    chrome.storage.sync.get(['account'], (result) => {
      console.log('account result', result)
      if (result.account) {
        this.account = result.account
      }
    });
  }

  save() {
    chrome.storage.sync.set(this.data_need_save(), () => {
      console.log('db saved');
    });
  }

  save_account(account) {
    this.account = account
    this.save()
  }

  remove_account() {
    this.account = null
    this.save()
  }

  data_need_save() {
    return {
      zoomPercents: this.zoomPercents,
      account: this.account
    }
  }

}

export default new Db()

