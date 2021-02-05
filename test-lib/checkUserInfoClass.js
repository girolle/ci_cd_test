module.exports = async (testClass, errors) => {
    let testObj;
    const get = (t, name) => {
        if (name === Symbol.toPrimitive) return () => "[primitive]";
        return new Proxy(new Function(), { apply, get });
    }
    const apply = get;
    const arg = new Proxy({}, { apply, get });
    try {
        testClassDeserialized = (new Function('document', 'return ' + testClass))(new Proxy({}, { apply, get }))
        testObj = new testClassDeserialized(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classConstructor', values: { className: 'UserInfo' } });
    }
    try {
        testObj.getUserInfo(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'UserInfo', method: 'getUserInfo' } });
    }
    try {
        testObj.setUserInfo(arg);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.classMethod', values: { className: 'UserInfo', method: 'setUserInfo' } });
    }
}