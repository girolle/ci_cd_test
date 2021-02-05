const traverse = require("@babel/traverse");
function useState(ast) {
    const varNames = [];
    traverse.default(ast, {
        ArrayPattern: ({ node: { elements } }) => void varNames.push(
            ...elements
                .map(({ name }) => name)
        )
    })
    return [
        varNames.filter(varName => !varName.startsWith('set')),
        varNames.filter(varName => varName.startsWith('set'))
    ];
}
function checkStateVarExistence(ast, stateVarsErrorMap){
    let errors = [];
    const [stateVarNames, setters] = useState(ast);
    if (setters.length === 0) {
        /*
        нет такого:
        const [isEditProfilePopupOpen, setEditProfilePopup] = React.useState(false);
        или название второй переменной начинается не с "set"
        */
        errors.push('student_web_project_error.p10.componentStateHookNotFound')
        return errors
    }
    for (let needleStateVar of Object.keys(stateVarsErrorMap)) {
        if (!stateVarNames.includes(needleStateVar)) {
            errors.push(stateVarsErrorMap[needleStateVar])
        }
    }
    return errors
}
module.exports = { useState,checkStateVarExistence };
