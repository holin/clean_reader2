// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import _ from 'lodash';
import Db from '../libs/db.js';
import $ from 'jquery';

new function($) {
  function init($) {
    var off_status = {};

    var off = true;
    var on_path = {
      '19': 'icon-16.png',
      '38': 'icon-32.png'
    };
    var off_path = {
      '19': 'icon-16_off.png',
      '38': 'icon-32_off.png'
    };
    chrome.browserAction.setIcon({
      path: off_path
    });

    function update_icon_for_tab(tabId) {
      var is_off = off_status[tabId];
      if (is_off === undefined) {
        is_off = true;
      }
      // console.log("update_icon_for_tab", tabId, off_status, is_off);
      if (is_off) {
        chrome.browserAction.setIcon({
          path: off_path
        });
        chrome.browserAction.setBadgeText({
          tabId: tabId,
          text: ''
        });
      } else {
        chrome.browserAction.setIcon({
          path: on_path
        });
        chrome.browserAction.setBadgeText({
          tabId: tabId,
          text: 'on'
        });
      }
    }

    chrome.tabs.onActivated.addListener(function(info) {
      var tabId = info.tabId;
      update_icon_for_tab(tabId);
    });

    chrome.extension.onMessage.addListener(function(
      request,
      sender,
      sendResponse
    ) {
      var tabId = sender.tab.id;
      var action = request.action || 'toggle';
      // console.log("request", request)
      switch (action) {
        case 'toggle':
          off_status[tabId] = request.is_off;
          update_icon_for_tab(tabId);
          sendResponse({ toggle: 'success' });
          break;
        case 'init_zoom_percents':
          // console.log("init_zoom_percents action")
          sendResponse(Db.zoomPercents);
          break;
        case 'update_zoom_percent':
          // console.log("update_zoom_percent action", request)
          Db.zoomPercents[request.domain] = request.percent;
          Db.save();
          sendResponse({ update_zoom_percent: 'success' });
          break;
        default:
          off_status[tabId] = request.is_off;
          update_icon_for_tab(tabId);
          sendResponse({ toggle: 'success' });
          break;
      }
    });

    chrome.browserAction.onClicked.addListener(function(tab) {
      chrome.tabs.executeScript(null, { code: 'reader.toggle()' });
    });
  }
  init($);
}($);
