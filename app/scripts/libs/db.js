class Db {
  constructor () {
    // console.log("db init")
    this.zoomPercents = {}
    chrome.storage.sync.get(['db'], (items) => {
      if (items.db) {
        this.zoomPercents = items.db.zoomPercents || {}
      }
    });
  }

  save() {
    chrome.storage.sync.set({'db': this.data_need_save()}, () => {
      // console.log('db saved');
    });
  }

  data_need_save() {
    return {
      zoomPercents: this.zoomPercents
    }
  }

}

export default new Db()

