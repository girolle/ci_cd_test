module.exports = async (testClass, testParentClass, errors) => {
    let testObj;
    const get = () => new Proxy(new Function(), { apply, get });
    const apply = get;
    const arg = new Proxy({}, { apply, get });
    try {
        testParentClassDeserialized = (new Function('document', 'return ' + testParentClass))(new Proxy({}, { apply, get }));
        testClassDeserialized = (new Function('document', 'Popup', 'return ' + testClass))(new Proxy({}, { apply, get }), testParentClassDeserialized);
        testObj = new testClassDeserialized(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classConstructor', values: { className: 'PopupWithImage' } });
    }
    try {
        if (testClassDeserialized.__proto__ !== testParentClassDeserialized) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classInherit', values: { className: 'PopupWithImage', classParent: 'Popup' } });
    }
}