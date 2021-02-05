const esquery = require('esquery');
const esprima = require('esprima');

module.exports = function (js, errors) {
  try {
    const ast = esprima.parseModule(js, { loc: true });
    const calls = esquery.query(ast, 'CallExpression');
    const funCalls = calls.filter(x => 'name' in x.callee).map(x => [x.callee.name, x.loc.start.line]);
    const funNameMap = new Map();
    for (const fun of funCalls) {
      if (funNameMap.has(fun[0])) {
        funNameMap.get(fun[0]).push(fun[1]);
      } else {
        funNameMap.set(fun[0], [fun[1]]);
      }
    }
    let oftenFun = '';
    let oftenFunCnt = 0;
    for (const fun of funNameMap) {
      if (fun[1].length > oftenFunCnt) {
        oftenFun = fun[0];
        oftenFunCnt = fun[1].length;
      }
    }
    if (funNameMap.get(oftenFun).length === 2) {
      errors.push({ id: 'student_web_project_error.codeRedundant', values: { line: funNameMap.get(oftenFun)[1] }, com: "будет только в 5 работе, игнорируйте" });
    }
    const selectorCalls = esquery.query(ast, 'CallExpression:has([name=querySelector],[name=querySelectorAll])');
    const oftenSelector = new Set();
    for (const selector of selectorCalls) {
      if (selector.arguments[0].type !== 'Literal') continue;
      const selectorStr = selector.arguments[0].value;
      if (oftenSelector.has(selectorStr)) {
        errors.push({ id: 'student_web_project_error.codeRedundantDOM', values: { line: selector.loc.start.line }, com: "будет только в 5 работе, игнорируйте" });
        break;
      }
      oftenSelector.add(selectorStr);
    }
  } catch (e) { }
};