const { Tokenizer, getTokenizer } = require('./getTokenizer.js');

module.exports = function (html, cssFiles, errors) {
  cssFiles = Array.isArray(cssFiles) ? [...cssFiles] : [];
  const tokenizer = getTokenizer(html);
  const links = [];
  while (true) {
    const token = tokenizer.getNextToken();
    if (token.type === Tokenizer.EOF_TOKEN) break;
    if (token.tagName === 'link') {
      const attrObj = {};
      for (let attr of token.attrs) {
        attrObj[attr.name] = attr.value;
      }
      if (attrObj.rel === "stylesheet") {
        links.push(attrObj.href);
      }
    }
  }
  for (let link of links) {
    if (link.includes(cssFiles[0]))
      cssFiles.shift();
  }
  if (cssFiles.length > 0) {
    errors.push({ id: 'student_web_project_error.linkOrder', values: { href: cssFiles[0] } });
  }
};