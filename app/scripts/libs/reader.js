class Reader {
  constructor($) {
    console.log('reader constuctor');

    this.$ = $;
    this.off = true;
    this.reading = false;
    this.target_selector = 'div,section,article,p';
    this.current_zoom = 100;
    this.origin_width = 800;
    this.zoom_step = 10;
    this.parent_origin_height = 0;

    //css class
    this.id = 'clean-reader-container-2';
    this.prepare_klass = 'clean-reader-body-prepare-2'
    this.mask_klass = 'clean-reader-mask'
    this.body_klass = 'clean-reader-body-2'
    this.hide_klass = 'clean-reader-hide';
    this.show_klass = 'clean-reader-show';
    this.main_show_klass = 'clean-reader-show-main';
    this.target_klass = 'clean-reader-target'
    this.clearfix_klass = 'clean-reader-clearfix'


  }

  toggle() {
    if (this.off) {
      this.run();
    } else {
      this.close();
    }
    this.off = !this.off;
  }

  run() {
    console.log('reader run');
    this.init_events();
  }

  close() {
    console.log('reader close');
    let $ = this.$;
    // close code pre first?
    if ($('body .max-pre').length > 0) {
      $('body .max-pre').remove();
      return;
    }

    let $parent = $("."+this.main_show_klass).parent();
    // $parent.css("height", "" + this.parent_origin_height + "px");

    $('body *')
      .removeClass(this.hide_klass)
      .removeClass(this.show_klass)
      .removeClass(this.main_show_klass);
    $("."+this.clearfix_klass).remove();

    this.reading = false;
    $('.' + this.mask_klass).remove();
    $('.' + this.target_klass).removeClass(this.target_klass);
    $('#' + this.id).attr("id", "");
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
    if ($(elem).parents("." + this.target_klass).length > 0) {
      console.log("parent", $(elem).parents("." + this.target_klass))
      elem = $(elem).parents("." + this.target_klass)
    }
    this.clear_selection();
    $('html')
      .attr('id', this.id)
      .addClass(this.body_klass)
      .removeClass(this.prepare_klass);

    let $parent = $(elem).parent()
    if (this.parent_origin_height == 0) {
      this.parent_origin_height = $parent.height()
    }

    $('body *').addClass(this.hide_klass);
    $parent.addClass(this.main_show_klass)

    var e = $(elem)
      .addClass(this.show_klass)
      .removeClass(this.target_klass);

    //insert mask
    $('body').prepend('<div class="'+this.mask_klass+'"></div>');
    //end insert mask

    e
      .removeClass(this.hide_klass)
      .find('*')
      .removeClass(this.hide_klass);
    while (e.get(0).tagName != 'BODY') {
      e.removeClass(this.hide_klass)
      if (!e.is("."+this.main_show_klass)) {
        e.addClass(this.show_klass);
      }
      e = e.parent();
    }

    let max_height = $(window).height()
    let child_height = $parent.find("> ." + this.show_klass).height()
    if (child_height > max_height) {
      max_height = child_height
    }
    max_height += 50
    // $parent.css('height', '' + max_height + 'px').find(">."+this.show_klass).append("<div class='"+this.clearfix_klass+"'></div>")

    this.reading = true;
    setTimeout(function() {
      $(window).scrollTop(0)
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
        fn();
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
      $('.'+this.target_klass).removeClass(this.target_klass);
      $this.addClass(this.target_klass);
    });

    $(this.target_selector).dblclick(e => {
      if (this.off || this.reading) {
        return;
      }
      this.read($(e.target));
      return false;
    });

    $('body').on('dblclick', '.'+this.body_klass+' pre', e => {
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
}

export default Reader;
