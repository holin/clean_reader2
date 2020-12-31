import hotkeys from 'hotkeys-js'

class Reader {
  constructor ($) {
    // console.log('reader constuctor');

    this.$ = $
    this.off = true
    this.reading = false
    this.target_selector = 'div,section,article,p,td,main,aside'
    this.current_zoom = 100
    this.origin_width = 0
    this.zoom_step = 10
    this.parent_origin_height = 0
    this.max_width = 900
    this.zoomPercents = {}

    //css class
    this.id = 'clean-reader-container-2'
    this.prepare_klass = 'clean-reader-body-prepare-2'
    this.mask_klass = 'clean-reader-mask'
    this.body_klass = 'clean-reader-body-2'
    this.hide_klass = 'clean-reader-hide'
    this.show_klass = 'clean-reader-show'
    this.main_show_klass = 'clean-reader-show-main'
    this.target_klass = 'clean-reader-target'
    this.clearfix_klass = 'clean-reader-clearfix'
    this.used_target_klass = 'clean-reader-used-target'
    this.root_klass = 'clean-reader-root'
    this.insert_klass = 'clean-reader-insert-node'
  }

  toggle () {
    if (this.off) {
      this.run()
    } else {
      this.close()
    }
    this.off = !this.off
    this.msg_toggle()
  }

  run () {
    // console.log('reader run');
    this.init_events()
  }

  zoomin (multiple) {
    if (!multiple) {
      multiple = 1
    }
    this.current_zoom += this.zoom_step * multiple
    this.dozoom()
  }

  zoomout (multiple) {
    if (!multiple) {
      multiple = 1
    }
    this.current_zoom -= this.zoom_step * multiple
    this.dozoom()
  }

  scrollPage () {
    let $ = this.$
    let $target = $('.clean-reader-show-main')
    let $container = $target.parent()
    let one_screen = $(window).height()
    let line_height = 30 // FIXME
    $target.scrollTop($target.scrollTop() + one_screen - line_height * 1.5)
  }

  dozoom () {
    let $ = this.$
    // console.log("Reader.current_zoom", Reader.current_zoom)
    let $target = $('.' + this.root_klass).find('.' + this.used_target_klass)
    if ($target.length == 0) {
      $target = $('.' + this.insert_klass).find('.' + this.used_target_klass)
    }
    $target.css('zoom', '' + this.current_zoom + '%')
    let pre_zoom = (100 / this.current_zoom) * 100
    if (pre_zoom < 100) {
      pre_zoom = 100;
    }

    $target.find('pre').css('zoom', '' + pre_zoom + '%')
    this.update_zoom()
    this.resize()
  }

  update_zoom () {
    this.zoomPercents[self.location.hostname] = this.current_zoom
    this.msg_update_zoom_percent()
  }

  resize () {
    let $ = this.$
    let $used = $('.' + this.used_target_klass)
    let w = this.max_width / this.current_zoom * 100

    $used[0].style.removeProperty('max-width');
    $used[0].style.setProperty('max-width', '' + w + 'px', 'important');

    setTimeout(() => {
      this.set_same_height()
    }, 10)
  }

  set_same_height () {
    let $ = this.$
    let $main = $('.' + this.main_show_klass)

    var e = $main
    var styles = [
      'height: ' + $(window).height() + 'px !important',
      'width: ' + $(window).width() + 'px !important',
      'max-width: 100% !important',
      'max-height: 100% !important',
      'flex-basis: auto !important'
    ]
    while (e.get(0).tagName != 'BODY') {
      e.attr("style", styles.join(";"))
      e = e.parent()
    }
  }

  close () {
    // console.log('reader close');
    let $ = this.$

    if ($(".hide-via-escape").length > 0) {
      return;
    }

    // close code pre first?
    if ($('body .max-pre').length > 0) {
      $('body .max-pre').remove()
      return;
    }

    // TODO remove indicator

    $('.' + this.root_klass).remove()

    this.reading = false
    $('.progress-indicator-c').remove();
    $('.darkmode-toggle').remove();
    $('.' + this.mask_klass).remove()
    $('.' + this.target_klass).removeClass(this.target_klass)
    $('#' + this.id).attr('id', '')
    $('html')
      .removeClass(this.body_klass)
      .removeClass(this.prepare_klass)
    if (!this.off) {
      $('html').addClass(this.prepare_klass)
    }
  }

  init_indicator () {
    let $ = this.$
    //TODO init indicator
    $('body').append("<div class='progress-indicator-c'><div class='progress-indicator'></div></div>")
    $('.clean-reader-show-main').scroll(() => {
      this.update_indicator()
    })
  }

  init_darkmode_toggle () {
    let $ = this.$
    //TODO init indicator
    $('body').append("<div class='darkmode-toggle'>dark</div>")
  }

  removeHoveredElement () {
    let $ = this.$
    console.log('rr', $('.'+this.target_klass), $('.'+this.target_klass).get(0))
    $('.'+this.target_klass).remove()
  }

  update_indicator () {
    let $ = this.$
    let height = $('.clean-reader-used-target').height()

    height = height * this.current_zoom / 100

    height -= $('.clean-reader-show-main').height()

    let top = $('.clean-reader-show-main').scrollTop()

    let percent = (top / height) * 100
    if (percent > 100) {
      percent = 100
    }
    $('.progress-indicator').css('width', '' + percent + '%')
  }

  read (elem) {
    let $ = this.$

    //find parent target
    if ($(elem).parents('.' + this.target_klass).length > 0) {
      // console.log('parent', $(elem).parents('.' + this.target_klass));
      elem = $(elem).parents('.' + this.target_klass)
    }

    // clone node
    elem.addClass(this.used_target_klass)
    e = elem
    let origin_e = e
    while (e.get(0).tagName != 'BODY') {
      origin_e = e
      e = e.parent()
    }

    let cloned_elem = $(origin_e.clone())
    cloned_elem.addClass(this.root_klass)

    // hide all other node
    $('body *').addClass(this.hide_klass)
    elem.removeClass(this.used_target_klass)

    elem = cloned_elem.find('.' + this.used_target_klass)

    if (elem.length == 0) {
      // self node, insert a parent node
      cloned_elem = $('<div class="' + this.insert_klass + '"></div>').append(cloned_elem)
    }

    // append to body
    $('body').append(cloned_elem)

    elem = cloned_elem.find('.' + this.used_target_klass)

    // hide all node
    cloned_elem.find('*').addClass(this.hide_klass)

    let $parent = $(elem).parent()

    if (this.parent_origin_height == 0) {
      this.parent_origin_height = $parent.height()
    }
    // console.log('$(window).width()', $(window).width());
    $parent.css('width', '' + $(window).width() + 'px')
      .css('max-width', '' + $(window).width() + 'px !important')

    this.clear_selection()
    $('html')
      .attr('id', this.id)
      .addClass(this.body_klass)
      .removeClass(this.prepare_klass)

    $parent.addClass(this.main_show_klass)

    var e = elem
    e.addClass(this.show_klass)
      .removeClass(this.target_klass)
      .removeClass(this.hide_klass)
      .find('*')
      .removeClass(this.hide_klass)

    while (e.get(0).tagName != 'BODY') {
      e.removeClass(this.hide_klass)
      if (!e.is('.' + this.main_show_klass)) {
        e.addClass(this.show_klass)
      }
      e = e.parent()
    }

    cloned_elem.find('.' + this.hide_klass).remove()

    this.reading = true

    //update img src
    this.fix_img_src()

    setTimeout(e => {
      $(window).scrollTop(0)
      if (this.origin_width == 0) {
        this.origin_width = $parent.width()
      }
      this.current_zoom = this.zoomPercents[self.location.hostname] || 100
      this.dozoom()

      //init indicator
      this.init_indicator()
      this.init_darkmode_toggle()

    }, 1)
  }

  // Fix <img data-s="300,640" data-type="png" data-src="https://mmbiz.qpic.cn/mmbiz_png/rhmfj3YNVIJnqvQ3eV88hdw0APLwxFGTpib9HmSNvHNJaZcWcDibc8kAUclOICWYjiaeics4dEFhVhE5DnTm53T5ew/0?wx_fmt=png" data-copyright="0" class="img_loading" data-ratio="0.7487352445193929" data-w="593" src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==" style="width: 593px !important; height: 444px !important;">
  fix_img_src () {
    let $ = this.$
    $('#' + this.id).find('img').each(function () {
      let $img = $(this)
      //Get real img src
      let data_src = $img.attr('data-src')
      let src = $img.attr('src')
      let need_update_src = data_src && data_src.length > 0 && data_src != src
      if (need_update_src) {
        $img.attr('src', data_src)
      }
    })
  }

  init_events () {
    let $ = this.$
    //addClass to body
    $('html').addClass(this.prepare_klass)

    hotkeys('a', (e) => {
      this.update_indicator()
    })

    hotkeys('rr', (e) => {
      this.removeHoveredElement()
    })

    hotkeys('space', (e) => {
      this.scrollPage()
      return false
    })

    hotkeys('shift+=', (e) => {
      this.zoomin(10)
    })

    hotkeys('shift+-', (e) => {
      this.zoomout(10)
    })

    $(document).keyup(e => {
      e.preventDefault();
      if (this.off) {
        return
      }
      var fn = this.keycode_map()['' + e.keyCode]
      if (typeof fn === 'function') {
        fn.apply(this)
      }
    })

    $(document).mousemove(e => {
      if (this.off || this.reading) {
        return
      }
      var $this = $(e.target)
      if ($this.is('.' + this.target_klass)) {
        return
      }

      if (!$this.is(this.target_selector)) {
        if ($this.parents(this.target_selector).length == 0) {
          $('.' + this.target_klass).removeClass(this.target_klass)
        }
        return
      }
      $('.' + this.target_klass).removeClass(this.target_klass)
      $this.addClass(this.target_klass)
    })

    $(this.target_selector).dblclick(e => {
      if (this.off || this.reading) {
        return
      }
      this.read($(e.target))
      return false
    })

    $('body').on('dblclick', '.' + this.body_klass + ' pre', e => {
      this.max_pre($(e.target))
    })

    $('body').on('click', '.pre-background-toggle', e => {
      var container = $(e.target).parents('.max-pre')
      if (container.is('.max-pre-dark')) {
        $(e.target).text('dark')
        container.removeClass('max-pre-dark').addClass('max-pre-light')
      } else {
        $(e.target).text('light')
        container.removeClass('max-pre-light').addClass('max-pre-dark')
      }
    })

    $('body').on('click', '.clean-reader-close', e => {
      this.close()
    })

    $('body').on('click', '.clean-reader-zoom-out', e => {
      this.zoomout()
    })
    $('body').on('click', '.clean-reader-zoom-in', e => {
      this.zoomin()
    })
    $('body').on('click', '.darkmode-toggle', e => {
      $('#' + this.id).toggleClass('darkmode')
    })

  }

  clear_selection () {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty()
      } else if (window.getSelection().removeAllRanges) {
        // Firefox
        window.getSelection().removeAllRanges()
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty()
    }
  }

  keycode_map () {
    if (!this.reading) {
      return {}
    }
    return {
      '27': this.close,
      '187': this.zoomin,
      '189': this.zoomout
    }
  }

  // messages
  msg_toggle () {
    chrome.extension.sendMessage(
      {
        action: 'toggle',
        is_off: this.off
      },
      function (response) {
        // console.log(response);
      }
    )
  }

  msg_init_zoom_percents () {
    chrome.extension.sendMessage(
      {
        action: 'init_zoom_percents'
      },
      response => {
        this.zoomPercents = response || {}
        // console.log("init_zoom_percents", response)
      }
    )
  }

  msg_update_zoom_percent () {
    chrome.extension.sendMessage(
      {
        action: 'update_zoom_percent',
        domain: self.location.hostname,
        percent: this.current_zoom
      },
      function (response) {}
    )
  }
  // end messages
}

export default Reader
