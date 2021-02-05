module.exports = async (testClass, testParentClass, errors) => {
    let testObj;
    const get = (t, name) => {
        if (name === Symbol.toPrimitive) return () => "[primitive]";
        return new Proxy(new Function(), { apply, get });
    }
    const apply = get;
    const arg = new Proxy({}, { apply, get });
    const document = arg;
    try {
        testParentClassDeserialized = (new Function('document', 'return ' + testParentClass))(new Proxy({}, { apply, get }));
        testClassDeserialized = (new Function('document', 'Popup', 'return ' + testClass))(new Proxy({}, { apply, get }), testParentClassDeserialized);
        testObj = new testClassDeserialized(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classConstructor', values: { className: 'PopupWithForm' } });
    }
    try {
        if (testClassDeserialized.__proto__ !== testParentClassDeserialized) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classInherit', values: { className: 'PopupWithForm', classParent: 'Popup' } });
    }
    try {
        testObj._getInputValues(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'PopupWithForm', method: '_getInputValues' } });
    }
    try {
        testObj.setEventListeners(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'PopupWithForm', method: 'setEventListeners' } });
    }
    try {
        testObj.close(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'PopupWithForm', method: 'close' } });
    }
}