const parse5path = require.resolve('parse5').slice(0, -9);
const Tokenizer = require(`${parse5path}/tokenizer`);
const Mixin = require(`${parse5path}/utils/mixin`);
const locationMixin = require(`${parse5path}/extensions/location-info/tokenizer-mixin.js`);

const voidElements = new Set(['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
  'img', 'input', 'keygen', 'link', 'meta', 'param, source', 'track', 'wbr']);
const tagNames = new Set(["a", "abbr", "address", "area", "article", "aside", "audio",
  "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption",
  "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn",
  "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer",
  "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html",
  "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main",
  "map", "mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option",
  "output", "p", "param", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s",
  "samp", "script", "section", "select", "small", "source", "span", "strong", "style",
  "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot",
  "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr"]);
const tagNamesWeb = new Set(["a", "abbr", "acronym", "address", "applet", "area", "article",
  "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button",
  "canvas", "caption", "center", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del",
  "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure",
  "font", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "i",
  "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta",
  "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param",
  "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select",
  "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "svg", "table", "tbody",
  "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]);
const tagNamesSVG = new Set(["a", "altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion",
  "animateTransform", "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "discard", "ellipse", "feBlend",
  "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap",
  "feDistantLight", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage",
  "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight",
  "feTile", "feTurbulence", "filter", "font", "font-face", "font-face-format", "font-face-name",
  "font-face-src", "font-face-uri", "foreignObject", "g", "glyph", "glyphRef", "hatch", "hatchpath",
  "hkern", "image", "line", "linearGradient", "marker", "mask", "mesh", "meshgradient", "meshpatch", "meshrow",
  "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect",
  "script", "set", "solidcolor", "stop", "style", "svg", "switch", "symbol", "text", "textPath", "title", "tref",
  "tspan", "unknown", "use", "view", "vkern"]);
const tagNamesDeprecated = new Set(["acronym", "applet", "basefont", "big", "center", "dir",
  "font", "frame", "frameset", "noframes", "strike", "tt"]);
const tagNamesDeprecatedSVG = new Set(["font"]);

function getTokenizer(html) {
  const tokenizer = new Tokenizer();
  Mixin.install(tokenizer, locationMixin);
  tokenizer.write(html, true);
  return {
    getNextToken: () => {
      const token = tokenizer.getNextToken();
      if (voidElements.has(token.tagName)) {
        token.ackSelfClosing = true;
      }
      if ((token.type === Tokenizer.DOCTYPE_TOKEN && token.name === 'html') || token.type === Tokenizer.COMMENT_TOKEN) {
        token.__HTML5_tag__ = true;
        token.__Web_tag__ = true;
        token.__dep_tag__ = false;
        token.__svg_tag__ = false;
        token.__dep_svg_tag__ = false;
      } else {
        token.__HTML5_tag__ = tagNames.has(token.tagName);
        token.__Web_tag__ = tagNamesWeb.has(token.tagName);
        token.__dep_tag__ = tagNamesDeprecated.has(token.tagName);
        token.__svg_tag__ = tagNamesSVG.has(token.tagName);
        token.__dep_svg_tag__ = tagNamesDeprecatedSVG.has(token.tagName);
      }
      return token;
    }
  };
}

module.exports = { Tokenizer, getTokenizer };
