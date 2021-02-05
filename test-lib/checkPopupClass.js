module.exports = async (testClass, errors) => {
    let testObj;
    const get = () => new Proxy(new Function(), { apply, get });
    const apply = get;
    const arg = new Proxy({}, { apply, get });
    try {
        testClassDeserialized = (new Function('document', 'return ' + testClass))(new Proxy({}, { apply, get }))
        testObj = new testClassDeserialized(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classConstructor', values: { className: 'Popup' } });
    }
    try {
        testObj.open(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'Popup', method: 'open' } });
    }
    try {
        testObj.close(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'Popup', method: 'close' } });
    }
    try {
        testObj.setEventListeners(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'Popup', method: 'setEventListeners' } });
    }
}