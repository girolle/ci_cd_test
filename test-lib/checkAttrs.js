const { Tokenizer, getTokenizer } = require('./getTokenizer.js');

const memo_getAttrObj = new Map();

function getAttrObj(AttrArr) {
  if (!memo_getAttrObj.has(AttrArr)) {
    const attrObj = {};
    for (let attr of AttrArr) {
      attrObj[attr.name] = attr.value;
    }
    memo_getAttrObj.set(AttrArr, attrObj);
  }
  return memo_getAttrObj.get(AttrArr);
}

function isOpenA(token) {
  return token.type === Tokenizer.START_TAG_TOKEN && token.tagName === 'a';
}

function isOpenImg(token) {
  return token.type === Tokenizer.START_TAG_TOKEN && token.tagName === 'img';
}

function addError(errors, id, token) {
  errors.push({ id: 'student_web_project_error.' + id, values: { line: token.location.startLine } });
}

const rules = [
  (token, errors) => {
    if (isOpenA(token)) {
      const attrObj = getAttrObj(token.attrs);
      if ('href' in attrObj
        && !/^_blank$/i.test(attrObj.target)
        && !/^_self$/i.test(attrObj.target)
        && !/^_parent$/i.test(attrObj.target)
        && !/^_top$/i.test(attrObj.target)) {
        addError(errors, 'emptyTarget', token);
      }
    }
  },
  (token, errors) => {
    if (isOpenImg(token)) {
      const attrObj = getAttrObj(token.attrs);
      if ('width' in attrObj) {
        addError(errors, 'redWidth', token);
      }
    }
  },
  (token, errors) => {
    if (isOpenImg(token)) {
      const attrObj = getAttrObj(token.attrs);
      if ('height' in attrObj) {
        addError(errors, 'redHeight', token);
      }
    }
  },
  (token, errors) => {
    if (isOpenImg(token)) {
      const attrObj = getAttrObj(token.attrs);
      if (!attrObj.alt) {
        addError(errors, 'needAlt', token);
      }
    }
  },
  (token, errors) => {
    if (isOpenImg(token)) {
      const attrObj = getAttrObj(token.attrs);
      if (!attrObj.src) {
        addError(errors, 'needSrc', token);
      }
    }
  }
];

module.exports = function (html, errors) {
  const tokenizer = getTokenizer(html);
  let insideTemplate = 0;
  while (true) {
    const token = tokenizer.getNextToken();
    if (token.type === Tokenizer.EOF_TOKEN) break;
    if (token.tagName === 'template') {
      if (token.type === Tokenizer.END_TAG_TOKEN) {
        insideTemplate--;
      }
      if (token.type === Tokenizer.START_TAG_TOKEN) {
        insideTemplate++;
      }
    }
    if (insideTemplate === 0) {
      rules.forEach(rule => rule(token, errors));
    }
  }
};