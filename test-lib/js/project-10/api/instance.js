const traverse = require("@babel/traverse");
module.exports = (ast) => {
    let varName = ''
    let result = null
    traverse.default(ast, {
        ExportDefaultDeclaration: ({ node: { declaration } }) => {
            // export default varName;
            if (declaration.type === 'Identifier') {
                varName = declaration.name;
            }
            // export default new Class(...args)
            if (declaration.type === 'NewExpression') {
                result = declaration.arguments;
            }
        }
    })
    if(!result) {
        traverse.default(ast, {
            // varName = new Class(..args)
            VariableDeclarator: ({ node: { id, init } }) => {
                if (id.name === varName) {
                    result = init.arguments;
                }
            }
        })
    }
    return result
}
