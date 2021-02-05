const http = require('http');
const fs = require('fs');
const path = require('path');

const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'runFetchTests.json'), 'utf8'));

function router(request, response) {
    if (request.method === 'GET') {
        if (/test[\/]+cards/.test(request.url)) {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(jsonData.response.cards));
        }
        if (/test_fail[\/]+cards/.test(request.url)) {
            response.statusCode = 404;
            response.end('Not found');
        }
        if (/test[\/]+users[\/]+me/.test(request.url)) {
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(jsonData.response.user));
        }
    }
    if (request.method === 'POST') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        request.pipe(response);
    }
    if (request.method === 'DELETE') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify([request.method, request.url]));
    }
    if (request.method === 'PATCH') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        request.pipe(response);
    }
    if (request.method === 'PUT') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify([request.method, request.url]));
    }
}

function getMethods(cur) {
    const methods = new Set(Object.getOwnPropertyNames(cur.prototype));
    for (let key of Object.getOwnPropertyNames(class { }.prototype)) {
        methods.delete(key);
    }
    return Array.from(methods).filter(key => typeof cur.prototype[key] === 'function');
}

module.exports = async (testClass, errors) => {
    const local = http.createServer(router);
    local.listen(0, 'localhost');
    await new Promise(resolve => local.on('listening', resolve));
    const testObj = new testClass({
        address: `http://${local.address().address}:${local.address().port}/`,
        groupId: 'test',
        token: 'test_token'
    });
    //const methods = getMethods(testClass);
    try {
        const res = await testObj.getAppInfo();
        if (res[0][0].name !== jsonData.response.cards[0].name) { throw new Error(); }
        if (res[0][1].name !== jsonData.response.cards[1].name) { throw new Error(); }
        if (res[1].name !== jsonData.response.user.name) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_getAppInfo_fail' });
    }
    try {
        const res = await testObj.getCardList();
        if (res[0].name !== jsonData.response.cards[0].name) { throw new Error(); }
        if (res[1].name !== jsonData.response.cards[1].name) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_getCardList_fail' });
    }
    try {
        const link = 'linkName' + Math.random();
        const name = 'picName' + Math.random();
        const res = await testObj.addCard({ name, link });
        if (res.link !== link) { throw new Error(); }
        if (res.name !== name) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_addCard_fail' });
    }
    try {
        const cardID = Math.round(Math.random() * 1000);
        const res = await testObj.removeCard(cardID);
        if (res[0] !== 'DELETE') { throw new Error(); }
        if (!RegExp('/test[\\/]+cards/' + cardID).test(res[1])) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_removeCard_fail' });
    }
    try {
        const res = await testObj.getUserInfo();
        if (res.name !== jsonData.response.user.name) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_getUserInfo_fail' });
    }
    try {
        const about = 'about' + Math.random();
        const name = 'picName' + Math.random();
        const res = await testObj.setUserInfo({ name, about });
        if (res.about !== about) { throw new Error(); }
        if (res.name !== name) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_setUserInfo_fail' });
    }
    try {
        const avatar = 'avatar' + Math.random();
        const res = await testObj.setUserAvatar({ avatar });
        if (res.avatar !== avatar) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_setUserAvatar_fail' });
    }
    try {
        const cardID = Math.round(Math.random() * 1000);
        const resLike = await testObj.changeLikeCardStatus(cardID, true);
        if (resLike[0] !== 'PUT') { throw new Error(); }
        if (!RegExp('/test[\\/]+cards[\\/]+like/' + cardID).test(resLike[1])) { throw new Error(); }
        const resDislike = await testObj.changeLikeCardStatus(cardID, false);
        if (resDislike[0] !== 'DELETE') { throw new Error(); }
        if (!RegExp('/test[\\/]+cards[\\/]+like/' + cardID).test(resDislike[1])) { throw new Error(); }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.Api_changeLikeCardStatus_fail' });
    }
    const testObjFail = new testClass({
        address: `http://${local.address().address}:${local.address().port}/`,
        groupId: 'test_fail',
        token: 'test_token'
    });
    try {
        const res = await testObjFail.getCardList();
        errors.push({ id: 'student_web_project_error.Api_noErrorCheck' });
    } catch (excep) { }
    local.close();
}
