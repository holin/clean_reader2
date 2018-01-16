import $ from 'jquery';
import _ from 'lodash'
import Reader from './libs/reader.js';
import hotkeys from 'hotkeys-js';

const reader = new Reader($);
window.reader = reader;
reader.msg_init_zoom_percents();
// import 'chromereload/devonly'

new function($) {
  function doublePress(key, fn) {
    hotkeys(key, (e) => {
      let scope = 'scope-'+key;
      if (hotkeys.getScope(scope) !== 'all') {
        fn();
        hotkeys.deleteScope(scope);
      } else {
        hotkeys.setScope(scope);
        setTimeout(() => {
          hotkeys.deleteScope(scope);
        }, 500);
      }
    });
  }

  function init($) {

    // Back to top by press `b` twice in 500 millisecond.
    doublePress('b', () => {
      $('html,body').animate({scrollTop:0},0);
    });

    doublePress('d', () => { reader.toggle(); });

    hotkeys('esc', (e) => {
      //escape
      reader.close();
    });
  }
  init($);
}($);
