const fs = require('fs');
const path = require('path');

module.exports = (absPath, relPath, errors) => {
    const files = [
        path.join('src', 'index.css'),
        path.join('public', 'index.html'),
        path.join('src', 'blocks'),
        path.join('src', 'components', 'App.js'),
        path.join('src', 'components', 'Card.js'),
        path.join('src', 'components', 'ImagePopup.js'),
        path.join('src', 'components', 'PopupWithForm.js'),
        path.join('src', 'components', 'Main.js'),
        path.join('src', 'components', 'Header.js'),
        path.join('src', 'components', 'Footer.js'),
        path.join('src', 'components', 'AddPlacePopup.js'),
        path.join('src', 'components', 'EditAvatarPopup.js'),
        path.join('src', 'components', 'EditProfilePopup.js'),
        path.join('src', 'utils', 'api.js'),
        path.join('src', 'utils', 'utils.js'),
        path.join('src', 'contexts', 'CurrentUserContext.js'),
        path.join('README.md'),
        //path.join('.gitignore')
    ];
    for (const file of files) {
        if (!fs.existsSync(path.join(absPath, file))) {
            errors.push({ id: 'student_web_project_error.fileNotFound', values: { fileName: path.join(relPath, file) } });
        }
    }
}