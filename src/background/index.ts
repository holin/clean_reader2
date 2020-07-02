// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import _ from 'lodash'
import Db from '../libs/db'
import API from '../libs/api'
import $ from 'jquery'

new function ($) {
  function init($) {
    var off_status = {}

    var off = true
    var on_path = {
      '19': 'icons/icon-16.png',
      '38': 'icons/icon-32.png'
    }
    var off_path = {
      '19': 'icons/icon-16_off.png',
      '38': 'icons/icon-32_off.png'
    }
    chrome.browserAction.setIcon({
      path: off_path
    })

    function update_icon_for_tab(tabId) {
      var is_off = off_status[tabId]
      if (is_off === undefined) {
        is_off = true
      }
      if (is_off) {
        chrome.browserAction.setIcon({
          path: off_path
        })
        chrome.browserAction.setBadgeText({
          tabId: tabId,
          text: ''
        })
      } else {
        chrome.browserAction.setIcon({
          path: on_path
        })
        chrome.browserAction.setBadgeText({
          tabId: tabId,
          text: 'on'
        })
      }
    }

    chrome.tabs.onActivated.addListener(function (info) {
      var tabId = info.tabId
      update_icon_for_tab(tabId)
    })

    chrome.extension.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      var tabId = sender.tab.id
      var action = request.action || 'toggle'
      switch (action) {
        case 'toggle':
          off_status[tabId] = request.is_off
          update_icon_for_tab(tabId)
          sendResponse({
            toggle: 'success'
          })
          break
        case 'init_zoom_percents':
          sendResponse(Db.zoomPercents)
          break
        case 'update_zoom_percent':
          Db.zoomPercents[request.domain] = request.percent
          Db.save()
          sendResponse({
            update_zoom_percent: 'success'
          })
          break
        default:
          off_status[tabId] = request.is_off
          update_icon_for_tab(tabId)
          sendResponse({
            toggle: 'success'
          })
          break
      }
    })

    chrome.browserAction.onClicked.addListener(function (tab) {
      chrome.tabs.executeScript(null, {
        code: 'reader.toggle()'
      })
    })
  }
  init($)
}($)


function create_word(word, callback) {
  word = word.trim()
  if (word.length < 1) {
    return
  }
  API.save_word(word).then(response => {
    let message = 'saved failed'
    if (!!response.success) {
      // notify success
      message = 'saved success'
    }
    callback({cmd: 'message', message: message})
  }).catch(e => {
    console.log('saved word error', e)
  })
}

function generate_port_messager(port) {
  return function port_messager (msg) {
    switch (msg.cmd) {
      case 'create-word':
        create_word(msg.word, function (message) {
          port.postMessage(message);
        })
        break
      default:
    }
  }
}

let port = null
chrome.runtime.onConnect.addListener(function(_port) {
  if (_port.name != "create-words-port") {
    return
  }
  port = _port
  port.onMessage.addListener(generate_port_messager(port));
});


let save_word_menu = null
if(!save_word_menu) {
  save_word_menu = chrome.contextMenus.create({
    title: "Save word \"%s\"",
    contexts: ["selection"],
    onclick: function(info, tab) {
      const words = info.selectionText
      port.postMessage({cmd: 'create-words', words: words})
    }
  })
}
