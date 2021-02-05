const traverse = require("@babel/traverse");

function checkJSXBindings(ast, onElement, needles, errorsMap) {
    const found = [];
    traverse.default(ast, {
        JSXElement: ({ node }) => {
            if (node.openingElement.name.name === onElement) {
                const localFound = new Map();
                if (Array.isArray(node.openingElement.attributes)) {
                    for (const { name, value } of node.openingElement.attributes) {
                        localFound.set(name.name, value.expression ? value.expression.name : value.value);
                    }
                }
                found.push(localFound)
            }
        },
    })
    const result = []
    for (const needleName of Object.keys(needles)) {
        for (let localFound of found) {
            if (!localFound.has(needleName)) {
                result.push(errorsMap[needleName] + '.notFound')
            } else {
                if (needles[needleName] !== '&any' && localFound.get(needleName) !== needles[needleName]) {
                    result.push(errorsMap[needleName] + '.incorrectHandlerName')
                }
            }
        }
    }
    return result
}

module.exports = checkJSXBindings;

