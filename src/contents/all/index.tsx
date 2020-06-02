import './style.scss';

import $ from 'jquery'
import _ from 'lodash'
import Reader from '../../libs/reader'
import hotkeys from 'hotkeys-js'

const reader = new Reader($)
window.reader = reader
reader.msg_init_zoom_percents()
// import 'chromereload/devonly'

new function ($) {
  var clickTimes = {}

  function doublePress(key, fn) {
    clickTimes[key] = 0

    hotkeys(key, (e) => {
      var time = clickTimes[key] || 0
      if (time > 0) {
        fn()
        clickTimes[key] = 0
      } else {
        clickTimes[key] = time + 1
        setTimeout(() => {
          clickTimes[key] = 0
        }, 700)
      }
    })
  }

  function triplePress(key, fn) {
    clickTimes[key] = 0

    hotkeys(key, (e) => {
      var time = clickTimes[key] || 0
      if (time > 1) {
        fn()
        clickTimes[key] = 0
      } else {
        clickTimes[key] = time + 1
        setTimeout(() => {
          clickTimes[key] = 0
        }, 700)
      }
    })
  }

  function init($) {
    // detect selction
    $(document).mouseup(function (e) {
      mouseup_event = e
    })
    $(document).mousedown(function (e) {
      mouseup_event = e
    })

    if (window.location.pathname === '/kbsweb/') {
      let makeTeamVSFunc = function () {
        let inserted = false
        _.each($('.schedule-item'), function (item) {
          let $item = $(item)
          let html = _.map($item.find('.team'), function (team) {
            return $.trim($(team).text().replace(/\d*\(\d\)/g, ''))
          }).join('vs')
          if (!$item.next().is('.vs-c')) {
            $item.after("<div class='vs-c' style='margin-left:40px;'><input type='text' value='" + html + "' style='border:1px solid #efefef; padding: 3px;text-align:center' onfocus='this.select()'></div>")
          } else {
            inserted = true
          }
        })
        if (!inserted) {
          setTimeout(() => {
            makeTeamVSFunc()
          }, 1000)
        }
      }
      makeTeamVSFunc()
    }

    // Back to top by press `b` twice in 500 millisecond.
    doublePress('b', () => {
      $('html,body').animate({
        scrollTop: 0
      }, 0)
    })

    triplePress('d', () => {
      reader.toggle()
    })

    hotkeys('esc', (e) => {
      // escape
      reader.close()
    })
  }
  init($)
}($)

let mouseup_event = null
function alert_message(message) {
  $('body').append(`
    <div class="cr-alert-message">${message}</div>
  `)
  if (mouseup_event) {
    $('.cr-alert-message').css({
      left: mouseup_event.pageX + 50,
      top: mouseup_event.pageY + 15
    })
  }
  setTimeout(() => {
    $('.cr-alert-message').remove()
  }, 3000)
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message) {
      alert_message( request.message )
    }
    // sendResponse({farewell: "goodbye"})
  }
);
