import $ from 'jquery';
import Reader from './libs/reader.js';
const reader = new Reader($);

new function($) {
  function init($) {
    let toggle_key_press_count = 0;
    $(document).keyup(function(e) {
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
