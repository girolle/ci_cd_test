const { Tokenizer, getTokenizer } = require('./getTokenizer.js');

module.exports = function (html, reqTags, redTags, errors) {
  const redTagSet = new Set(Array.isArray(redTags) ? redTags : []);
  const reqTagSet = new Set(Array.isArray(reqTags) ? reqTags : []);
  const tokenizer = getTokenizer(html);
  while (true) {
    const token = tokenizer.getNextToken();
    if (token.type === Tokenizer.EOF_TOKEN) break;
    if (redTagSet.has(token.tagName)) {
      errors.push({ id: 'student_web_project_error.tagRedundant', values: { tagName: token.tagName, line: token.location.startLine } });
    }
    reqTagSet.delete(token.tagName);
  }
  for (let tag of reqTagSet) {
    errors.push({ id: 'student_web_project_error.tagsNeeded', values: { tagName: tag } });
  }
};