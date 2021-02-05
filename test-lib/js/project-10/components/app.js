const traverse = require("@babel/traverse");
const { useState } = require("./state");

/*
const [isEditProfilePopupOpen, setEditProfilePopup] = React.useState(false);
* */


function checkHandlersCode(ast) {
    const handlersMap = new Map()

    function handleBlockStatement(name, { body }) {
        body.forEach(({ expression }) => {
            // setAddPlacePopup(...
            if (!expression) return;
            const { callee, arguments } = expression
            if (!callee || !Array.isArray(arguments) || callee.type !== 'Identifier') return;
            /// ...true)
            if (arguments && arguments[0] && arguments[0].value) {
                handlersMap.set(name, [callee.name, ...handlersMap.get(name)])
            }
        })
    }

    traverse.default(ast, {
        // const handleEditProfileClick = () =>
        VariableDeclaration: ({ node: { declarations } }) => void
            declarations.forEach(
                ({ id: { name }, init }) => {
                    if (typeof name === 'string' && !handlersMap.has(name)) {
                        handlersMap.set(name, [])
                    }
                    if (init.body && init.body.body)
                        handleBlockStatement(name, init.body)
                }
            ),
        FunctionDeclaration: ({ node: { id: { name }, body }, }) => {
            if (typeof name === 'string' && !handlersMap.has(name)) {
                handlersMap.set(name, [])
            }
            if (body && body.body)
                handleBlockStatement(name, body)
        }
    })
    for (const [key, value] of handlersMap.entries()) {
        if (value.length === 0) handlersMap.delete(key)
    }
    return Object.fromEntries(handlersMap)
}

function checkLogic(ast, needles, errorMap) {
    const errors = []
    const [, setters] = useState(ast);
    const handlers = checkHandlersCode(ast);
    const handlersNames = Object.keys(handlers);
    needles.forEach((needle) => {
        if (!handlersNames.includes(needle) || !setters.some(setter => handlers[needle].includes(setter))) {
            errors.push(errorMap[needle])
        }
    })
    return errors;
}

function checkSelectedCard(ast, handlerName, closeHandlerName, errorsMap) {
    let isHandleCardClick = false
    let isCloseHandleCardClick = false;

    function handleExpression(name, expression) {
        // setSelectedCard(...
        if (!expression) return;
        const { callee, arguments } = expression
        if (!callee || !Array.isArray(arguments) || callee.type !== 'Identifier') return;
        if (callee.name === 'setSelectedCard')
            if (arguments && arguments[0]) {
                /// ...cardClicked)
                if (name === handlerName && arguments[0].name.includes('card')) {
                    isHandleCardClick = true;
                }
                /// ...<any>)
                else {
                    isCloseHandleCardClick = true;
                }
            }
    }

    function handleArrowFunction(name, body) {
        if (body.type === 'ArrowFunctionExpression') {
            handleBlockStatement(name, body.body)
        } else {
            handleBlockStatement(name, body)
        }
    }

    function handleBlockStatement(name, body) {
        body.body.forEach(({ expression }) => handleExpression(name, expression))

    }

    function visitor(name, body) {
        if (typeof name === 'string'
            && [handlerName, closeHandlerName].includes(name)
            && body) handleArrowFunction(name, body)

    }

    traverse.default(ast, {
        // const handleEditProfileClick = () =>
        VariableDeclaration: ({ node: { declarations } }) =>
            declarations.forEach(({ id: { name }, init }) => init && init.body ? visitor(name, init) : void 0),
        FunctionDeclaration: ({ node: { id: { name }, body } }) => visitor(name, body)
    })
    let errors = []
    if (!isHandleCardClick) errors.push(errorsMap['handleCardClick']);
    if (!isCloseHandleCardClick) errors.push(errorsMap['handleClosePopups']);
    return errors;
}

module.exports = { checkLogic, checkSelectedCard };
