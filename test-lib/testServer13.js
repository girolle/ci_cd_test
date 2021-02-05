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
        http.get(`http://localhost:${port}/${reletiveURI}`, (res) => {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                resolve({ done: true, data: { res, rawData } });
            });
        }).on('error', (e) => {
            resolve({ done: false });
        });
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
            headers: {}
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
            headers: {}
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
let server;
const User = mongoose.model('user', new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Поле "name" должно быть заполнено'],
        minlength: [2, 'Минимальная длина поля "name" - 2'],
        maxlength: [30, 'Максимальная длина поля "name" - 30'],
    },
    about: {
        type: String,
        required: [true, 'Поле "about" должно быть заполнено'],
        minlength: [2, 'Минимальная длина поля "about" - 2'],
        maxlength: [30, 'Максимальная длина поля "about" - 30'],
    },
    avatar: {
        type: String,
        required: [true, 'Поле "avatar" должно быть заполнено'],
        validate: {
            validator: (v) => true,
            message: 'Поле "avatar" должно быть валидным url-адресом.',
        },
    },
}, { versionKey: false }));

module.exports = async (projectPath, errors) => {
    try {
        await startServer(projectPath);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerStartFailed' });
    }
    try {
        await mongoose.connect('mongodb://localhost:27017/mestodb', {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        //await User.create({ _id: mongoose.Types.ObjectId('5fd2335b95ae2111cc1803dd'), name: 'initName', about: 'initName', avatar: 'initAvatar' });
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userDBInitFailed' });
    }
    let userID;
    try {
        const resp = await post('users', 'name=test&password=tPass&about=ab&email=em@em.ru&avatar=av.bmp');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        userID = json.data._id;
        if (json.data.name !== 'test') {
            throw new Error();
        }
        if (json.data.about !== 'ab') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users', meth: 'POST' } });
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
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/:userId', meth: 'GET' } });
    }
    try {
        const resp = await post('cards', 'name=testCard&link=test.link');
        if (!resp.done) {
            throw new Error();
        }
        //const json = JSON.parse(resp.data.rawData);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards', meth: 'POST' } });
    }
    try {
        const resp = await get('cards');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (!Array.isArray(json.data)) {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards', meth: 'GET' } });
    }
    try {
        const resp = await delete_method('cards/1');
        if (!resp.done) {
            throw new Error();
        }
        //const json = JSON.parse(resp.data.rawData);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards/:cardId', meth: 'DELETE' } });
    }
    try {
        const resp = await patch('users/me', 'name=test2&about=ab2');
        if (!resp.done) {
            throw new Error();
        }
        //const json = JSON.parse(resp.data.rawData);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/me', meth: 'PATCH' } });
    }
    try {
        const resp = await patch('users/me/avatar', 'avatar=av2.bmp');
        if (!resp.done) {
            throw new Error();
        }
        //const json = JSON.parse(resp.data.rawData);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/me/avatar', meth: 'PATCH' } });
    }
    try {
        const resp = await put('cards/1/likes');
        if (!resp.done) {
            throw new Error();
        }
        //const json = JSON.parse(resp.data.rawData);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: 'cards/:cardId/likes', meth: 'PUT' } });
    }
    try {
        const resp = await delete_method('cards/1/likes');
        if (!resp.done) {
            throw new Error();
        }
        //const json = JSON.parse(resp.data.rawData);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: 'cards/:cardId/likes', meth: 'DELETE' } });
    }
    await stopServer();
}