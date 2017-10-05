class Reader {
  constructor($) {
    // console.log('reader constuctor');

    this.$ = $;
    this.off = true;
    this.reading = false;
    this.target_selector = 'div,section,article,p';
    this.current_zoom = 100;
    this.origin_width = 0;
    this.zoom_step = 10;
    this.parent_origin_height = 0;
    this.max_width = 900;
    this.zoomPercents = {};

    //css class
    this.id = 'clean-reader-container-2';
    this.prepare_klass = 'clean-reader-body-prepare-2';
    this.mask_klass = 'clean-reader-mask';
    this.body_klass = 'clean-reader-body-2';
    this.hide_klass = 'clean-reader-hide';
    this.show_klass = 'clean-reader-show';
    this.main_show_klass = 'clean-reader-show-main';
    this.target_klass = 'clean-reader-target';
    this.clearfix_klass = 'clean-reader-clearfix';
    this.used_target_klass = 'clean-reader-used-target';
    this.root_klass = 'clean-reader-root';
  }

  toggle() {
    if (this.off) {
      this.run();
    } else {
      this.close();
    }
    this.off = !this.off;
    this.msg_toggle();
  }

  run() {
    // console.log('reader run');
    this.init_events();
  }

  zoomin() {
    this.current_zoom += this.zoom_step;
    this.dozoom();
  }

  zoomout() {
    this.current_zoom -= this.zoom_step;
    this.dozoom();
  }

  dozoom() {
    let $ = this.$;
    // console.log("Reader.current_zoom", Reader.current_zoom)
    $('.' + this.root_klass)
      .find('.' + this.used_target_klass)
      .css('zoom', '' + this.current_zoom + '%');
    this.update_zoom();
    this.resize();
  }

  update_zoom() {
    this.zoomPercents[self.location.hostname] = this.current_zoom;
    this.msg_update_zoom_percent();
  }

  resize() {
    let $ = this.$;
    let $used = $('.' + this.used_target_klass);
    let w = this.max_width / this.current_zoom * 100;

    $used.css('width', '' + w + 'px');

    setTimeout(() => {
      this.set_same_height()
    }, 10);
  }

  set_same_height() {
    let $ = this.$;
    let $main = $('.' + this.main_show_klass);

    var e = $main
    while (e.get(0).tagName != 'BODY') {
      e
        .css('height', '' + $(window).height() + 'px')
        .css('width', '' + $(window).width() + 'px');
      e = e.parent();
    }
  }

  close() {
    // console.log('reader close');
    let $ = this.$;
    // close code pre first?
    if ($('body .max-pre').length > 0) {
      $('body .max-pre').remove();
      return;
    }

    $("."+this.root_klass).remove();

    this.reading = false;
    $('.' + this.mask_klass).remove();
    $('.' + this.target_klass).removeClass(this.target_klass);
    $('#' + this.id).attr('id', '');
    $('html')
      .removeClass(this.body_klass)
      .removeClass(this.prepare_klass);
    if (!this.off) {
      $('html').addClass(this.prepare_klass);
    }
  }

  read(elem) {
    let $ = this.$;

    //find parent target
    if ($(elem).parents('.' + this.target_klass).length > 0) {
      // console.log('parent', $(elem).parents('.' + this.target_klass));
      elem = $(elem).parents('.' + this.target_klass);
    }

    //clone node
    elem.addClass(this.used_target_klass)
    e = elem;
    let origin_e = e;
    while (e.get(0).tagName != 'BODY') {
      origin_e = e;
      e = e.parent();
    }

    let cloned_elem = $(origin_e.clone());
    cloned_elem.addClass(this.root_klass)

    //hide all other node
    $('body *').addClass(this.hide_klass);
    elem.removeClass(this.used_target_klass)

    //append to body
    $('body').append(cloned_elem);

    //hide all node
    cloned_elem.find('*').addClass(this.hide_klass);

    elem = cloned_elem.find("."+this.used_target_klass)

    let $parent = $(elem).parent();
    if (this.parent_origin_height == 0) {
      this.parent_origin_height = $parent.height();
    }
    // console.log('$(window).width()', $(window).width());
    $parent.css('width', '' + $(window).width() + 'px');

    this.clear_selection();
    $('html')
      .attr('id', this.id)
      .addClass(this.body_klass)
      .removeClass(this.prepare_klass);

    $parent.addClass(this.main_show_klass);

    var e = elem;
    e.addClass(this.show_klass)
      .removeClass(this.target_klass)
      .removeClass(this.hide_klass)
      .find('*')
      .removeClass(this.hide_klass);
    while (e.get(0).tagName != 'BODY') {
      e.removeClass(this.hide_klass);
      if (!e.is('.' + this.main_show_klass)) {
        e.addClass(this.show_klass);
      }
      e = e.parent();
    }

    cloned_elem.find('.' + this.hide_klass).remove()

    let $child = $parent.find('> .' + this.show_klass);

    // $parent.append("<div class='" + this.clearfix_klass + "'></div>");

    this.reading = true;
    setTimeout(e => {
      $(window).scrollTop(0);
      if (this.origin_width == 0) {
        this.origin_width = $parent.width();
      }
      this.current_zoom = this.zoomPercents[self.location.hostname] || 100;
      this.dozoom();
    }, 1);
  }

  init_events() {
    let $ = this.$;
    //addClass to body
    $('html').addClass(this.prepare_klass);

    $(document).keyup(e => {
      if (this.off) {
        return;
      }
      var fn = this.keycode_map()['' + e.keyCode];
      if (typeof fn == 'function') {
        fn.apply(this);
      }
    });

    $(document).mousemove(e => {
      if (this.off || this.reading) {
        return;
      }
      var $this = $(e.target);
      if ($this.is('.' + this.target_klass)) {
        return;
      }

      if (!$this.is(this.target_selector)) {
        if ($this.parents(this.target_selector).length == 0) {
          $('.' + this.target_klass).removeClass(this.target_klass);
        }
        return;
      }
      $('.' + this.target_klass).removeClass(this.target_klass);
      $this.addClass(this.target_klass);
    });

    $(this.target_selector).dblclick(e => {
      if (this.off || this.reading) {
        return;
      }
      this.read($(e.target));
      return false;
    });

    $('body').on('dblclick', '.' + this.body_klass + ' pre', e => {
      this.max_pre($(e.target));
    });

    $('body').on('click', '.pre-background-toggle', e => {
      var container = $(e.target).parents('.max-pre');
      if (container.is('.max-pre-dark')) {
        $(e.target).text('dark');
        container.removeClass('max-pre-dark').addClass('max-pre-light');
      } else {
        $(e.target).text('light');
        container.removeClass('max-pre-light').addClass('max-pre-dark');
      }
    });

    $('body').on('click', '.clean-reader-close', e => {
      this.close();
    });

    $('body').on('click', '.clean-reader-zoom-out', e => {
      this.zoomout();
    });
    $('body').on('click', '.clean-reader-zoom-in', e => {
      this.zoomin();
    });
  }

  clear_selection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty();
    }
  }

  keycode_map() {
    if (!this.reading) {
      return {};
    }
    return {
      '27': this.close,
      '187': this.zoomin,
      '189': this.zoomout
    };
  }

  //messages
  msg_toggle() {
    chrome.extension.sendMessage(
      {
        action: 'toggle',
        is_off: this.off
      },
      function(response) {
        // console.log(response);
      }
    );
  }

  msg_init_zoom_percents() {
    chrome.extension.sendMessage(
      {
        action: 'init_zoom_percents'
      },
      response => {
        this.zoomPercents = response || {};
        // console.log("init_zoom_percents", response)
      }
    );
  }

  msg_update_zoom_percent() {
    chrome.extension.sendMessage(
      {
        action: 'update_zoom_percent',
        domain: self.location.hostname,
        percent: this.current_zoom
      },
      function(response) {}
    );
  }
  //end messages
}

export default Reader;
