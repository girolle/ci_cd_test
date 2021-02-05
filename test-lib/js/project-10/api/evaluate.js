const traverse = require("@babel/traverse");
const fs = require('fs');
const runFetchTests = require('../../../runFetchTests')
const fetch = require('../../fetch')
module.exports = async (ast,errors) => {
    let start = 0, end = 0
    traverse.default(ast, {
        ClassDeclaration: ({ node }) => {
            start = node.start;
            end = node.end;
        }
    })
    const content = fs.readFileSync(ast.program.loc.filename, 'utf-8').toString();
    const classRef = (new Function('fetch', 'return ' + content.substring(start, end)))(fetch);
    await runFetchTests(classRef, errors)
    return errors
}
