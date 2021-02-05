const { Tokenizer, getTokenizer } = require('./getTokenizer.js');
const Articles = { find: () => 'a/an' };

function getNames(html) {
  const tokenizer = getTokenizer(html);
  const results = {
    nonHTML5TagSet: new Set(),
    nonWebTagSet: new Set(),
    depTagSet: new Set(),
    nonSVGTagSet: new Set(),
    depSVGTagSet: new Set(),
    rootTagSet: new Set(),
    headTagSet: new Set(),
    bodyTagSet: new Set(),
    svgTagSet: new Set()
  };
  let curSet = results.rootTagSet;
  while (true) {
    const token = tokenizer.getNextToken();
    if (token.type === Tokenizer.EOF_TOKEN) break;
    if (token.type === Tokenizer.WHITESPACE_CHARACTER_TOKEN) continue;
    if (token.type === Tokenizer.CHARACTER_TOKEN) continue;
    if (!token.__HTML5_tag__) {
      results.nonHTML5TagSet.add(token.tagName);
    }
    if (!token.__Web_tag__) {
      results.nonWebTagSet.add(token.tagName);
    }
    if (token.__dep_tag__) {
      results.depTagSet.add(token.tagName);
    }
    if (!token.__svg_tag__) {
      results.nonSVGTagSet.add(token.tagName);
    }
    if (token.__dep_svg_tag__) {
      results.depSVGTagSet.add(token.tagName);
    }
    if (token.type === Tokenizer.START_TAG_TOKEN) {
      curSet.add(token.tagName);
      if (token.tagName === 'head') {
        curSet = results.headTagSet;
      }
      if (token.tagName === 'body') {
        curSet = results.bodyTagSet;
      }
      if (token.tagName === 'svg') {
        curSet = results.svgTagSet;
      }
    }
    if (token.type === Tokenizer.END_TAG_TOKEN) {
      if (token.tagName === 'head' || token.tagName === 'body') {
        curSet = results.rootTagSet;
      }
      if (token.tagName === 'svg') {
        curSet = results.bodyTagSet;
      }
      curSet.add('/' + token.tagName);
    }
  }
  return results;
}

module.exports = function (html, errors) {
  const tagNames = getNames(html);
  const tags = Array.from(tagNames.rootTagSet)
    .concat(Array.from(tagNames.headTagSet))
    .concat(Array.from(tagNames.bodyTagSet));
  for (let tag of tags) {
    if (tagNames.nonWebTagSet.has(tag)) {
      errors.push({
        id: 'test.errors.common.redundantTagNonHTML5',
        values: {
          a_an: Articles.find(tag),
          name: tag
        }
      });
    }
    if (tagNames.depTagSet.has(tag)) {
      errors.push({
        id: 'test.errors.common.deprecatedTagNonHTML5',
        values: {
          a_an: Articles.find(tag),
          name: tag
        }
      });
    }
  }
  for (let tag of tagNames.svgTagSet) {
    if (tagNames.nonSVGTagSet.has(tag)) {
      errors.push({
        id: 'test.errors.common.redundantTagNonHTML5',
        values: {
          a_an: Articles.find(tag),
          name: tag
        }
      });
    }
    if (tagNames.depSVGTagSet.has(tag)) {
      errors.push({
        id: 'test.errors.common.deprecatedTagNonHTML5',
        values: {
          a_an: Articles.find(tag),
          name: tag
        }
      });
    }
  }
};
