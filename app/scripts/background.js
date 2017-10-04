// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'
import 'chromereload/devonly'

import _ from "lodash"
import Db from "./libs/db.js"

chrome.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
  Db.loadData()

})

chrome.browserAction.setBadgeText({
  text: `'Allo`
})

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log(_.max([3,1,6,5]))
  console.log("reload at", new Date(0))
 });

console.log(`'Allo 'Allo! Event Page for Browser Action`)
