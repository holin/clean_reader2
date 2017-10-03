console.log("db.js")
class Db {
  constructor () {
    console.log("db init")
  }

  loadData() {
    console.log("db loadData")
  }

}

export default new Db()
