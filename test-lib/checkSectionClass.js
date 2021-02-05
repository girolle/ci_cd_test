module.exports = async (testClass, errors) => {
    let testObj;
    const get = () => new Proxy(new Function(), { apply, get });
    const apply = get;
    const arg = new Proxy({}, { apply, get });
    try {
        testClassDeserialized = (new Function('document', 'return ' + testClass))(new Proxy({}, { apply, get }))
        testObj = new testClassDeserialized(arg, arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classConstructor', values: { className: 'Section' } });
    }
    try {
        testObj.renderItems(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'Section', method: 'renderItems' } });
    }
    try {
        testObj.addItem(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'Section', method: 'addItem' } });
    }
}