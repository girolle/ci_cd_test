const fs = require('fs');
const path = require('path');

module.exports = (absPath, relPath, errors) => {
    const neededFiles = new Set(['.css', /*'.html',*/ '.js']);
    const files = fs.readdirSync(absPath);
    for (const file of files) {
        const ext = path.extname(path.join(absPath, file)).toLowerCase();
        neededFiles.delete(ext);
    }
    if (neededFiles.size > 0) {
        errors.push({ id: 'student_web_project_error.11.srcExt' });
    }
}