class Words {
  constructor($, create_word_fn) {
    this.$ = $
    this.create_word_fn = create_word_fn

    this.bind_events()
  }

  bind_events() {
    let $ = this.$
    $('body').on('click', '.cr-word', e => {
      let $word = $(e.target)
      this.create_word_fn($word.text())
      $word.remove()
    })
  }

  clear_text_selection() {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.selection) {
      document.selection.empty();
    }
  }

  render_selects(words) {
    this.clear_text_selection()
    words = this.clean_words(words)
    if (words.length < 1) {
      return
    }
    let $ = this.$
    let htmls = []
    htmls.push('<div class="cr-words-to-create-c cr-closable"><div class="cr-closer">&times;</div><ul>')
    let len = words.length
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      htmls.push(`<li class="cr-word">${word}</li>`)
    }
    htmls.push('</ul></div>')
    $("body").append(htmls.join(''))
  }

  clean_words(words) {
    let kept_words = new Set()

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/^\d+$/, '')
      if (word.length > 2 && word.length < 20) {
        kept_words.add(word.toLowerCase())
      }
    }

    return Array.from(kept_words)
  }
}

export default Words
