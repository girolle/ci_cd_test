const http = require('http');
const mongoose = require('mongoose');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

async function startServer(projectPath) {
    const serverNames = ['app', 'index'];
    const appFile = path.join(projectPath, `${serverNames.filter(x => fs.existsSync(path.join(projectPath, `${x}.js`)))[0]}.js`);
    server = cp.spawn('node.exe', [appFile],
        {
            cwd: projectPath, env: { PORT: port }
        }
    );
}
async function stopServer() {
    server.kill();
}
function get(reletiveURI) {
    return new Promise((resolve, reject) => {
        const get_options = {
            host: 'localhost',
            port: port,
            path: '/' + reletiveURI,
            method: 'GET',
            headers: {
                'Cookie': set_cookie
            }
        };
        const req = http.request(get_options, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve({ done: true, data: { res, rawData } });
            });
        }).on('error', (e) => {
            resolve({ done: false });
        });
        req.end();
    });
}
function post(reletiveURI, post_data) {
    return new Promise((resolve, reject) => {
        const post_options = {
            host: 'localhost',
            port: port,
            path: '/' + reletiveURI,
            method: 'POST',
            headers: {
                'Cookie': set_cookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
        const req = http.request(post_options, function (res) {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve({ done: true, data: { res, rawData } });
            });
        });
        req.write(post_data);
        req.end();
    });
}
function delete_method(reletiveURI) {
    return new Promise((resolve, reject) => {
        const delete_options = {
            host: 'localhost',
            port: port,
            path: '/' + reletiveURI,
            method: 'DELETE',
            headers: {
                'Cookie': set_cookie
            }
        };
        const req = http.request(delete_options, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve({ done: true, data: { res, rawData } });
            });
        }).on('error', (e) => {
            resolve({ done: false });
        });
        req.end();
    });
}
function put(reletiveURI) {
    return new Promise((resolve, reject) => {
        const put_options = {
            host: 'localhost',
            port: port,
            path: '/' + reletiveURI,
            method: 'PUT',
            headers: {
                'Cookie': set_cookie
            }
        };
        const req = http.request(put_options, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve({ done: true, data: { res, rawData } });
            });
        }).on('error', (e) => {
            resolve({ done: false });
        });
        req.end();
    });
}
function patch(reletiveURI, post_data) {
    return new Promise((resolve, reject) => {
        const patch_options = {
            host: 'localhost',
            port: port,
            path: '/' + reletiveURI,
            method: 'PATCH',
            headers: {
                'Cookie': set_cookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
        const req = http.request(patch_options, function (res) {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve({ done: true, data: { res, rawData } });
            });
        });
        req.write(post_data);
        req.end();
    });
}

const port = 4000;
const set_cookie = [];
let server;

module.exports = async (projectPath, errors) => {
    let mСonnect;
    try {
        await startServer(projectPath);
        mСonnect = await mongoose.connect('mongodb://localhost:27017/mestodb', {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerStartFailed' });
    }
    let userID;
    try {
        const resp = await post('signup', 'name=test&password=tPass&about=ab&email=em@em.ru&avatar=av.bmp');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'test') {
            throw new Error();
        }
        if (json.data.about !== 'ab') {
            throw new Error();
        }
        userID = json.data._id;
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/signup', meth: 'POST' } });
    }
    try {
        const resp = await post('signin', 'password=tPass&email=em@em.ru');
        if (!resp.done) {
            throw new Error();
        }
        set_cookie.push(...resp.data.res.headers['set-cookie']);
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'test') {
            throw new Error();
        }
        if (json.data.about !== 'ab') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/signin', meth: 'POST' } });
    }
    try {
        const resp = await post('cards', 'name=testCard&link=link.test');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'testCard') {
            throw new Error();
        }
        if (json.data.link !== 'link.test') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards', meth: 'POST' } });
    }
    let cardID;
    try {
        const resp = await get('cards');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data[0].name !== 'testCard') {
            throw new Error();
        }
        if (json.data[0].link !== 'link.test') {
            throw new Error();
        }
        cardID = json.data[0]._id;
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards', meth: 'GET' } });
    }
    try {
        const resp = await put('cards/' + cardID + '/likes');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (cardID !== json.data._id) {
            throw new Error();
        }
        if (userID !== json.data.likes[0]) {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: 'cards/' + cardID + '/likes', meth: 'PUT' } });
    }
    try {
        const resp = await delete_method('cards/' + cardID + '/likes');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (cardID !== json.data._id) {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: 'cards/' + cardID + '/likes', meth: 'DELETE' } });
    }
    try {
        const resp = await delete_method('cards/' + cardID);
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (cardID !== json.data._id) {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards/' + cardID, meth: 'DELETE' } });
    }
    try {
        const resp = await get('users');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data[0].name !== 'test') {
            throw new Error();
        }
        if (json.data[0].about !== 'ab') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users', meth: 'GET' } });
    }
    try {
        const resp = await get('users/' + userID);
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'test') {
            throw new Error();
        }
        if (json.data.about !== 'ab') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/' + userID, meth: 'GET' } });
    }
    try {
        const resp = await patch('users/me', 'name=test2&about=ab2');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'test2') {
            throw new Error();
        }
        if (json.data.about !== 'ab2') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/me', meth: 'PATCH' } });
    }
    try {
        const resp = await patch('users/me/avatar', 'avatar=av2.bmp');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'test2') {
            throw new Error();
        }
        if (json.data.about !== 'ab2') {
            throw new Error();
        }
        if (json.data.avatar !== 'av2.bmp') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/me/avatar', meth: 'PATCH' } });
    }
    await stopServer();
}