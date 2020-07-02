class Words {
  constructor ($, create_word_fn) {
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

  render_selects(words) {
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
    let kept_words = []

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^\w]+/i, '')
      if (word.length > 2) {
        kept_words.push(word.toLowerCase())
      }
    }

    return kept_words
  }
}

export default Words
