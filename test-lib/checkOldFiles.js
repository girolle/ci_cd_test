const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
    throw new Error('usage: node run.js "projectPath" proj12');
}
const argSet = new Set();
for (let i = 3; i < process.argv.length; i++) {
    argSet.add(process.argv[i]);
}

let originalFilesProjectFolder = (argSet.has('proj4') || argSet.has('proj5')) ? 'mesto-main' : (argSet.has('proj3') ? 'russian-travel-master' : 'how-to-learn-main');

const eachFile = (absPath, callback) => {
    if (fs.lstatSync(absPath).isDirectory()) {
        const files = fs.readdirSync(absPath);
        for (let file of files) {
            eachFile(path.join(absPath, file), callback);
        }
    } else callback(absPath);
}

const compareFiles = (fileName1, fileName2) => {
    try {
        const file1content = fs.readFileSync(fileName1).toString();
        const file2content = fs.readFileSync(fileName2).toString();
        return file1content === file2content;
    } catch (excep) {
        return false;
    }
}

const errors = [];
const changedFilesPath = path.join(__dirname, 'originalFiles', originalFilesProjectFolder);
const projectPath = process.argv[2];
const callback = filePath => {
    if (callback.stop) return;
    const relativePath = path.relative(changedFilesPath, filePath);
    const projectFilePath = path.join(projectPath, relativePath);
    if (compareFiles(filePath, projectFilePath)) {
        errors.push({ id: 'student_web_project_error.originalFile', values: { relativePath } });
        callback.stop = true;
    }
}
eachFile(changedFilesPath, callback);
console.log(errors);