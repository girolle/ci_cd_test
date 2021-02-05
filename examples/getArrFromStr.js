const esprima = require('esprima');
module.exports = str => {
  const tokens = esprima.tokenize(str);
  const buf = [], res = [];
  let bal = 0;
  for (let token of tokens) {
    buf.push(token.value);
    if (token.type === 'Punctuator') {
      if (token.value === '[') {
        bal++;
      } else if (token.value === ']') {
        bal--;
      }
    }
    if (bal === 0) {
      res.push(eval(buf.join('')));
      buf.length = 0;
    }
  }
  return res;
}