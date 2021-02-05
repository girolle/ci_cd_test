const { Tokenizer, getTokenizer } = require('./getTokenizer.js');

module.exports = function (html, errors) {
  const tokenizer = getTokenizer(html);
  while (true) {
    const token = tokenizer.getNextToken();
    if (token.type === Tokenizer.EOF_TOKEN) break;
    if (token.tagName === 'svg') {
      errors.push({ id: 'student_web_project_error.svg' });
      break;
    }
  }
};