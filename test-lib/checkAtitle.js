const { Tokenizer, getTokenizer } = require('./getTokenizer.js');

module.exports = function (html, errors) {
  const tokenizer = getTokenizer(html);
  let content = null;
  while (true) {
    const token = tokenizer.getNextToken();
    if (token.type === Tokenizer.EOF_TOKEN) break;
    if (token.type === Tokenizer.END_TAG_TOKEN && token.tagName === 'title') {
      if (!content) {
        errors.push({ id: 'student_web_project_error.emptyTitleTag' });
      }
      content = null;
    }
    if (content !== null && 'chars' in token) {
      content += token.chars;
    }
    if (token.type === Tokenizer.START_TAG_TOKEN && token.tagName === 'title') {
      content = '';
    }
  }
};