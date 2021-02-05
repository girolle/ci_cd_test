const log = console.log;
console.log = () => 0;

const fs = require('fs');
const path = require('path');

const stylelint = require('stylelint');
const htmlhint = require('htmlhint');
const eslint = require('eslint');

const checkSVG = require('./checkSVG.js');
const checkBEM = require('./checkBEM.js');
const checkTAG = require('./checkTAG.js');
const checkStyleOrder = require('./checkStyleOrder.js');
const checkAtitle = require('./checkAtitle.js');
const checkAttrs = require('./checkAttrs.js');
const tokenize = require('./css/tokenizer');
const getClassSrc = require('./js/getClassSrc.js');
const runFetchTests = require('./runFetchTests.js');
const fetch = require('./js/fetch.js');
const checkTagNames = require('./checkTagNames.js');
const toggleModalWindowProj5Check = require('./toggleModalWindowProj5Check.js');
const testServer12 = require('./testServer12.js');
const testServer13 = require('./testServer13.js');
const testServer15 = require('./testServer15.js');
const project10 = require('./js/project-10');

if (process.argv.length < 3) {
    throw new Error('usage: node run.js "projectPath" onlyjs/nojs webpack proj12');
}
const argSet = new Set();
for (let i = 3; i < process.argv.length; i++) {
    argSet.add(process.argv[i]);
}

const projectPath = path.normalize(process.argv[2]);

const ignoreFiles = new Map(fs.readdirSync(path.join(__dirname, 'ignoreFiles')).map(x => [x, new Set()]));

const ignoreCSSTokens = new Set(["Comment", "WhiteSpace"].map(x => tokenize.TYPE[x]));

const getFile = path => {
    if (/\.css$/i.test(path)) {
        const tokens = [];
        const content = fs.readFileSync(path).toString();
        const onToken = (type, start, end) => {
            if (!ignoreCSSTokens.has(type)) {
                tokens.push(content.substring(start, end));
            }
        }
        tokenize(content, onToken);
        return tokens.join(' ');
    } else { return fs.readFileSync(path); }
}

const stylelint_opt = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'stylelint.json'), 'utf-8').toString());
}

if (!argSet.has('onlyjs')) {
    stylelint.lint({
        files: projectPath + '/**/*.css', config: stylelint_opt()
    }).then(data => {
        const errors = [];
        for (let result of data.results) {
            for (let warning of result.warnings) {
                const fileName = path.relative(projectPath, result.source);
                const basename = path.basename(result.source);
                if (ignoreFiles.has(basename)) {
                    continue;
                }
                errors.push({
                    id: "stylelint." + warning.rule,
                    values: {
                        fileName,
                        line: warning.line,
                        column: warning.column
                    }
                });
            }
        }
        log(errors);
    });
}

fs.readdirSync(projectPath).map(file => (file === 'node_modules') ? log({ id: 'student_web_project_error.node_modules' }) : 0);
fs.readdirSync(projectPath).map(file => (file === 'dist') ? log({ id: 'student_web_project_error.externalLibFolder' }) : 0);
{
    const projectFiles = [projectPath];
    const maxFileCnt = 1000;
    let fileCnt = 0;
    loop: while (projectFiles.length > 0) {
        const realFilePath = projectFiles.pop();
        if (fs.lstatSync(realFilePath).isDirectory()) {
            const files = fs.readdirSync(realFilePath);
            for (let file of files) {
                projectFiles.push(path.join(realFilePath, file));
                fileCnt++;
                if (fileCnt > maxFileCnt) {
                    break loop;
                }
            }
        }
    }
    if (fileCnt > maxFileCnt) {
        log({ id: 'student_web_project_error.tooManyFiles' });
        if (argSet.has('tooManyFiles')) throw new Error('tooManyFiles');
    }
}

const getHTMLhint_opt = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'htmlhint.json'), 'utf-8').toString());
}

const getESlint_opt = () => {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'eslintrc.json'), 'utf-8').toString());
}

const { reqTags, redTags, styleOrder } = JSON.parse(fs.readFileSync(path.join(__dirname, 'tags.json'), 'utf-8').toString());

function useHTMLhint(dirname, localPath) {
    const realFilePath = path.join(dirname, localPath);
    if (fs.lstatSync(realFilePath).isDirectory()) {
        const files = fs.readdirSync(realFilePath);
        for (let file of files) {
            useHTMLhint(dirname, path.join(localPath, file));
        }
    } else {
        const ext = path.extname(localPath).toLowerCase();
        if (ext !== '.html') {
            return;
        }
        const content = fs.readFileSync(realFilePath, 'utf-8').toString();
        const issues = htmlhint.HTMLHint.verify(content, getHTMLhint_opt());
        const errors = issues.map(x => {
            const res = { values: {} };
            res.id = 'htmlhint.' + x.rule.id;
            res.values.line = x.line;
            res.values.column = x.col;
            return res;
        });
        if (errors.length === 0) {
            checkSVG(content, errors);
            checkBEM(content, errors);
            checkTAG(content, reqTags[localPath], redTags, errors);
            checkStyleOrder(content, styleOrder[localPath], errors);
            checkAtitle(content, errors);
            checkAttrs(content, errors);
            checkTagNames(content, errors);
        }
        for (let error of errors) {
            if (!('values' in error)) {
                error.values = {};
            }
            error.values.fileName = localPath;
        }
        log(errors);
    }
}

async function checkFetch(projectPath) {
    let classArray = [];
    function findApiClass(absPath) {
        if (fs.lstatSync(absPath).isDirectory()) {
            const files = fs.readdirSync(absPath);
            for (let file of files) {
                findApiClass(path.join(absPath, file));
            }
        } else {
            const content = fs.readFileSync(absPath, 'utf-8').toString();
            let classSrc = null;
            try {
                classSrc = getClassSrc(content, "Api");
                if (typeof classSrc === 'string' && classSrc.length > 0) {
                    classArray.push((new Function('fetch', 'return ' + classSrc))(fetch));
                }
            } catch (excep) { }
        }
    }
    findApiClass(projectPath);
    const errors = [];
    if (classArray.length === 1) {
        await runFetchTests(classArray[0], errors);
    } else {
        errors.push({ id: 'student_web_project_error.ApiClassNotFound' });
    }
    log(errors);
}
async function findClassByFileName(classMap, projectPath, fileName, className, errors) {
    let classArray = [];
    function checkName(absPath, fileName) {
        const name = path.basename(absPath);
        const nameB = name.substring(0, 1).toUpperCase() + name.substring(1);
        const nameS = name.substring(0, 1).toLowerCase() + name.substring(1);
        return nameB === fileName || nameS === fileName;
    }
    function findClass(absPath) {
        if (fs.lstatSync(absPath).isDirectory()) {
            const files = fs.readdirSync(absPath);
            for (let file of files) {
                findClass(path.join(absPath, file));
            }
        } else if (checkName(absPath, fileName)) {
            const content = fs.readFileSync(absPath, 'utf-8').toString();
            let classSrc = null;
            try {
                classSrc = getClassSrc(content, className);
                if (typeof classSrc === 'string' && classSrc.length > 0) {
                    classArray.push(classSrc);
                }
            } catch (excep) { }
        }
    }
    findClass(projectPath);
    if (classArray.length === 1) {
        classMap.set(className, classArray[0]);
    } else {
        errors.push({ id: 'student_web_project_error.fileAndClassNotFound', values: { fileName, className } });
    }
}
if (!argSet.has('onlyjs')) {
    useHTMLhint(projectPath, '');
}
if (!argSet.has('nojs')) {
    checkFetch(projectPath);
    try {
        const res = project10(projectPath);
        const out = [];
        for (const error of res) {
            if (typeof error === 'string') {
                out.push({ id: error });
            } else {
                out.push(error);
            }
        }
        log(out);
    } catch { }
    const errors = [];
    (async () => {
        const classMap = new Map();
        await findClassByFileName(classMap, projectPath, 'section.js', 'Section', errors);
        await findClassByFileName(classMap, projectPath, 'popup.js', 'Popup', errors);
        await findClassByFileName(classMap, projectPath, 'popup-with-image.js', 'PopupWithImage', errors);
        await findClassByFileName(classMap, projectPath, 'popup-with-form.js', 'PopupWithForm', errors);
        await findClassByFileName(classMap, projectPath, 'user-info.js', 'UserInfo', errors);
        await findClassByFileName(classMap, projectPath, 'card.js', 'Card', errors);
        await require('./checkSectionClass.js')(classMap.get('Section'), errors);
        await require('./checkPopupClass.js')(classMap.get('Popup'), errors);
        await require('./checkPopupWithImageClass.js')(classMap.get('PopupWithImage'), classMap.get('Popup'), errors);
        await require('./checkWithFormClass.js')(classMap.get('PopupWithForm'), classMap.get('Popup'), errors);
        await require('./checkUserInfoClass.js')(classMap.get('UserInfo'), errors);
        await require('./checkCardClass.js')(classMap.get('Card'), errors);
    })()
    try {
        const gitIgn = fs.readFileSync(path.join(projectPath, '.gitignore')).toString();
    } catch (excep) {
        errors.push({ id: 'student_web_project_error.fileNotFound', values: { fileName: '.gitignore' } });
    }
    if (argSet.has('webpack')) {
        try {
            const webpack = fs.readFileSync(path.join(projectPath, 'webpack.config.js')).toString();
        } catch (excep) {
            errors.push({ id: 'student_web_project_error.fileNotFound', values: { fileName: 'webpack.config.js' } });
        }
    }
    if (argSet.has('proj12')) {
        testServer12(projectPath, errors);
    }
    if (argSet.has('proj13')) {
        testServer13(projectPath, errors);
    }
    if (argSet.has('proj15')) {
        testServer15(projectPath, errors);
    }
    log(errors);
}

function checkIgnoredFiles(projectPath, errors) {
    function findAndCheck(absPath) {
        if (fs.lstatSync(absPath).isDirectory()) {
            const files = fs.readdirSync(absPath);
            for (let file of files) {
                findAndCheck(path.join(absPath, file));
            }
        } else {
            const basename = path.basename(absPath);
            if (!ignoreFiles.has(basename)) {
                return;
            }
            const content_ignore = getFile(path.join(__dirname, 'ignoreFiles', basename));
            const content = getFile(absPath);
            if (content_ignore !== content) {
                errors.push({
                    id: "stylelint.ignoreFile",
                    values: {
                        fileName: path.relative(projectPath, absPath)
                    }
                });
            }
        }
    }
    findAndCheck(projectPath);
}
checkIgnoredFiles(projectPath, []);

const eslintLinter = new eslint.Linter();

function useESlint(dirname, localPath) {
    const realFilePath = path.join(dirname, localPath);
    if (fs.lstatSync(realFilePath).isDirectory()) {
        const files = fs.readdirSync(realFilePath);
        for (let file of files) {
            useESlint(dirname, path.join(localPath, file));
        }
    } else {
        const ext = path.extname(localPath).toLowerCase();
        if (ext !== '.js') {
            return;
        }
        const content = fs.readFileSync(realFilePath, 'utf-8').toString();
        const issues = eslintLinter.verify(content, getESlint_opt());
        const errors = issues.filter(x => String(x.ruleId) !== 'null').map(x => {
            const res = { values: {} };
            res.id = 'eslint.' + x.ruleId;
            res.values.line = x.line;
            res.values.column = x.column;
            res.values.fileName = localPath;
            return res;
        });
        toggleModalWindowProj5Check(content, errors);
        log(errors);
    }
}
if (!argSet.has('nojs')) {
    useESlint(projectPath, '');
}