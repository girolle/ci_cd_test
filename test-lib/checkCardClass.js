module.exports = async (testClass, errors) => {
    let testObj;
    const get = () => new Proxy(new Function(), { apply, get });
    const apply = get;
    const arg = new Proxy({}, { apply, get });
    try {
        testClassDeserialized = (new Function('document', 'return ' + testClass))(new Proxy({}, { apply, get }))
        testObj = new testClassDeserialized(arg, arg, arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classConstructor', values: { className: 'Card' } });
    }
}