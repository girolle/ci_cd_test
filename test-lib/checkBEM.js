const { Tokenizer, getTokenizer } = require('./getTokenizer.js');
const bem_naming = require('bem-naming')({});

function getTokens(html) {
  const tokenizer = getTokenizer(html);
  const results = [];
  let token;
  while (true) {
    do {
      token = tokenizer.getNextToken();
    } while (!(token.type === Tokenizer.START_TAG_TOKEN
      || token.type === Tokenizer.END_TAG_TOKEN
      || token.type === Tokenizer.EOF_TOKEN))
    if (token.type === Tokenizer.EOF_TOKEN) break;
    token.classes = new Set();
    for (let attr of token.attrs) {
      if (attr.name === 'class') {
        const match = attr.value.match(/-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g);
        if (Array.isArray(match)) {
          for (let className of match) {
            token.classes.add(className);
          }
        }
      }
    }
    results.push(token);
  }
  return results;
}

function setError(errors, classValue, tag) {
  errors.push({
    id: 'не бэм',
    values: {
      class: classValue,
      line: tag.location.startLine,
      col: tag.location.startCol
    }
  });
}

function tagsHasBlock(parents, blockName) {
  for (let tag of parents) {
    for (let classValue of tag.classes) {
      if (bem_naming.isBlock(classValue)) {
        const bem_obj = bem_naming.parse(classValue);
        if (bem_obj.block === blockName) {
          return true;
        }
      }
    }
  }
  return false;
}

function tagsHasElem(tag, bem) {
  for (let classValue of tag.classes) {
    if (bem_naming.isElem(classValue)) {
      const bem_obj = bem_naming.parse(classValue);
      if (bem_obj.block === bem.block && bem_obj.elem === bem.elem) {
        return true;
      }
    }
  }
  return false;
}

function checkBlockMod(tag, errors) {
  for (let classValue of tag.classes) {
    if (bem_naming.isBlockMod(classValue)) {
      const bem_obj = bem_naming.parse(classValue);
      let good = false;
      for (let classValue2 of tag.classes) {
        if (bem_naming.isBlock(classValue2)) {
          const bem_obj2 = bem_naming.parse(classValue2);
          if (bem_obj.block === bem_obj2.block) {
            good = true;
          }
        }
      }
      if (!good) {
        setError(errors, classValue, tag);
      }
    }
  }
}

function checkBEMname(tag, errors) {
  for (let classValue of tag.classes) {
    const bem_obj = bem_naming.parse(classValue);
    if (typeof bem_obj === 'undefined') {
      setError(errors, classValue, tag);
    }
  }
}

function checkElemInsideBlock(parents, tag, errors) {
  for (let classValue of tag.classes) {
    if (bem_naming.isElem(classValue)) {
      const bem_obj = bem_naming.parse(classValue);
      if (!tagsHasBlock(parents, bem_obj.block)) {
        setError(errors, classValue, tag);
      }
    }
  }
}

function checkRecursive(parents, tag, errors) {
  for (let classValue of tag.classes) {
    for (let pTag of parents) {
      for (let classValue2 of pTag.classes) {
        if (classValue2 === classValue) {
          setError(errors, classValue, tag);
        }
      }
    }
  }
}

function checkModElem(tag, errors) {
  for (let classValue of tag.classes) {
    if (bem_naming.isElemMod(classValue)) {
      const bem_obj = bem_naming.parse(classValue);
      if (!tagsHasElem(tag, bem_obj)) {
        setError(errors, classValue, tag);
      }
    }
  }
}

function checkElement(parents, tag, errors) {
  const localErrors = [];
  checkBEMname(tag, localErrors);
  errors.push(...localErrors);
  if (localErrors.length > 0) return;
  checkBlockMod(tag, errors);
  checkElemInsideBlock(parents, tag, errors);
  checkModElem(tag, errors);
  checkRecursive(parents, tag, errors);
}

module.exports = function (html, errors) {
  const tokens = getTokens(html);
  const parents = [];
  let insideTemplate = 0;
  for (let token of tokens) {
    if (token.type === Tokenizer.END_TAG_TOKEN) {
      if (token.tagName === 'template') {
        insideTemplate--;
      }
      parents.pop();
    } else {
      if (token.tagName === 'template') {
        insideTemplate++;
      }
      if (insideTemplate === 0) {
        checkElement(parents, token, errors);
      }
      if (!(token.selfClosing || token.ackSelfClosing)) {
        parents.push(token);
      }
    }
  }
};