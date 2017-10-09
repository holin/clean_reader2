import $ from 'jquery';
import _ from 'lodash'
import Reader from './libs/reader.js';
const reader = new Reader($);
window.reader = reader;
reader.msg_init_zoom_percents();
// import 'chromereload/devonly'

new function($) {
  function init($) {
    let toggle_key_press_count = 0;
    $(document).keyup(function(e) {
      if (_.includes(['INPUT'], e.target.tagName)) {
        return;
      }
      // console.log('e.keyCode', e.keyCode);
      if (e.keyCode == 68) {
        //keypess: r
        toggle_key_press_count += 1;
        setTimeout(function() {
          toggle_key_press_count = 0;
        }, 500);
        if (toggle_key_press_count > 1) {
          reader.toggle();
        }
      } else {
        toggle_key_press_count = 0;
      }

      if (e.keyCode == 27) {
        //escape
        reader.close();
      }
    });
  }
  init($);
}($);
