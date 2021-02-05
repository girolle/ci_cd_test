const http = require('http');
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

const port = 4000;
let server;

module.exports = async (projectPath, errors) => {
    try {
        await startServer(projectPath);
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerStartFailed' });
    }
    try {
        const resp = await get('users');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data[0].name !== 'Ada Lovelace') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users', meth: 'GET' } });
    }
    try {
        const resp = await get('users/d285e3dceed844f902650f40');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data.name !== 'Tim Berners-Lee') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/users/d285e3dceed844f902650f40', meth: 'GET' } });
    }
    try {
        const resp = await get('cards');
        if (!resp.done) {
            throw new Error();
        }
        const json = JSON.parse(resp.data.rawData);
        if (json.data[0].likes[0].name !== 'Tim Berners') {
            throw new Error();
        }
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.userServerRequestFailed', value: { uri: '/cards', meth: 'GET' } });
    }
    await stopServer();
}