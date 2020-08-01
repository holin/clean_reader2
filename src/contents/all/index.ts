import './style.scss';

import $ from 'jquery'
import _ from 'lodash'
import Reader from '../../libs/reader'
import API from '../../libs/api'
import Words from '../../libs/words'
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

  (function ( $ ) {
    var keycodes = []
    $.fn.enlarge = function( options ) {
      // This is the easiest way to have default options.
    var settings = $.extend({
      pressed: function () { console.log('triplePress callback') },
      canceled: function () { console.log('canceled callback') },
    }, options )

    $(this).on('keyup', (e) => {
      keycodes.push(e.keyCode)
      var keycodes_joined = keycodes.join("-")
      if(keycodes_joined === "91-17" || keycodes_joined === "17-91") {
        settings.pressed($(this))
      } else if (e.keyCode === 27) {
        settings.canceled($(this))
      }
      setTimeout( function() {
        keycodes = []
      }, 1800)
    })

    return this
    };
  }( $ ));


  function init($) {
    // detect selction
    $(document).mouseup(function (e) {
      mouseup_event = e
    })
    $(document).mousedown(function (e) {
      mouseup_event = e
    })

    $(document).on('click', '.cr-closer', function (e) {
      $(this).parents('.cr-closable').remove()
    })

    $(document).on('click', function (e) {
      $('.cr-alert-message').remove()
    })

    $("textarea").enlarge({
      pressed: function($this) {
        $this.toggleClass('cr-enlarged-textarea')
      },
      canceled: function($this) {
        $this.removeClass('cr-enlarged-textarea')
      }
    })


    function nbaMakeTeamVsFunc() {
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
    }
    // nbaMakeTeamVsFunc()



    // Back to top by press `b` twice in 500 millisecond.
    doublePress('b', () => {
      $('html,body').animate({
        scrollTop: 0
      }, 0)
    })

    triplePress('d', () => {
      reader.toggle()
    })

    triplePress('g', () => {
      fetch_github_repo_last_commit()
    })

    hotkeys('esc', (e) => {
      // escape
      reader.close()
      global_escape()
    })
  }
  init($)
}($)

let global_escape = function() {
  // hide words selection
  $('.cr-words-to-create-c').remove()
}

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

function port_messager (msg) {
  if (msg.cmd) {
    switch(msg.cmd) {
      case 'create-words':
        // handle multiple words
        create_words(msg.words)
        break;
      case 'message':
        alert_message(msg.message)
        break;
      default:
        console.log('not implemented yet', msg)
        // code block
    }
  }
}
var port = chrome.runtime.connect({name: "create-words-port"})
port.onMessage.addListener(port_messager)

function send_create_word(word) {
  port.postMessage({cmd: 'create-word', word: word})
}

function github_port_messager(msg) {
  if (msg.cmd) {
    switch(msg.cmd) {
      case 'repo-last-commit-fetched':
        const id = msg.data.id
        const date = msg.data.commits[0].commit.author.date
        console.log($("#"+id), id, date)
        $("#"+id).append('<span style="color: gray; font-size: 0.8em;">(' + date + ')</span>')
        break;
      default:
        console.log('not implemented yet', msg)
        // code block
    }
  }
}
function fetch_github_repo_last_commit() {
  var port = chrome.runtime.connect({name: "github-port"})
  port.onMessage.addListener(github_port_messager)

  function pull_owner_and_repo(url) {
    let matches = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/)
    if (!matches) {
      return null
    }
    const owner = matches[1]
    const repo = matches[2]
    if (owner === 'site') {
      return null
    }

    if (owner && repo) {
      return { owner, repo }
    }
    return null
  }

  function rand_id() {
    return ("id" + Math.random()).replace('0.', '')
  }

  // fetch all a link
  let repos = []
  $('a').each(function(){
    let rtn = pull_owner_and_repo($(this).attr('href'))
    if (rtn) {
      const id = rand_id()
      $(this).attr('id', id)
      rtn.id = id
      repos.push(rtn)
    }
  })

  port.postMessage({cmd: 'repo-last-commit', repos: repos})
}

function create_words(words) {
  console.log('words before', words)
  words = words.replace(/[^\w]+/gi, ' ')
  console.log('words ater', words)
  words = words.split(/\s+/)
  if (words.length == 1) {
    send_create_word(words[0])
  } else if (words.length > 1) {
    // show words choose
    (new Words($, send_create_word.bind(this))).render_selects(words)
  }
}

