const traverse = require("@babel/traverse");

function findComponents(astArray) {
    const found = [];
    const visitor = ({ node: { id: { name } } }) => void found.push(name)
    for (const file of astArray) {
        traverse.default(file, {
            FunctionDeclaration: visitor,
            ClassDeclaration: visitor
        })
    }
    return found
}

/**
 * Check if code in file array (haystack) includes Classes or functions with given names (needle)
 * @param haystack
 * @param needle
 * @return {array}
 */
function check(haystack, needle) {
    const found = findComponents(haystack);
    return needle.filter(value => !found.includes(value));
}

/**
 * Check if code in file array (haystack) includes Classes or functions with given names (needle)
 * @param {array} astArray
 * @param {string[]} needles
 * @param {Object.<string,string>} errorsMap. Keys should match needles
 * @return {array} array of errors
 */
module.exports = (astArray, needles, errorsMap) =>
    check(astArray, needles).map(notFoundComponent => errorsMap[notFoundComponent]);

