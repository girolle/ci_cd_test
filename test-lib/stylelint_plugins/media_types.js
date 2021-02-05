const stylelint = require("stylelint");

const ruleName = "plugin/no-duplicate-properties-in-media";
const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: "Expected ..."
});

module.exports = stylelint.createPlugin(ruleName, function (
    primaryOption,
    secondaryOptionObject
) {
    return function (postcssRoot, postcssResult) {
        const validOptions = stylelint.utils.validateOptions(
            postcssResult,
            ruleName,
            {}
        );

        if (!validOptions) {
            return;
        }

        const propertiesMap = new Map();

        postcssRoot.walkDecls(node => {
            if (!propertiesMap.has(node.prop)) {
                propertiesMap.set(node.prop, new Map());
            }
            const selectorMap = propertiesMap.get(node.prop);
            if (node.parent.type !== 'rule') return;
            if (!selectorMap.has(node.parent.selector)) {
                selectorMap.set(node.parent.selector, new Set());
            }
            const propertyValues = selectorMap.get(node.parent.selector);
            if (propertyValues.has(node.value)) {
                stylelint.utils.report({
                    node,
                    message: messages.expected,
                    result: postcssResult,
                    ruleName
                });
            }
            propertyValues.add(node.value);
        });
    };
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;