const parser = require('@babel/parser');
const traverse = require("@babel/traverse");
const fs = require('fs');
const path = require('path')
const importBlockList = ['react', 'react-dom'];

const component = require('./components/exist.js')
const checkJSXBindings = require('./components/findJSX')
const checkApiInstance = require('./api/instance')
const { checkSelectedCard, checkLogic } = require("./components/app");
const { checkStateVarExistence } = require('./components/state')
const evaluate = require('./api/evaluate')
module.exports = (dir) => {
    const errorCodePrefix = 'student_web_project_error.p10';
    if (!fs.existsSync(path.join(dir, 'package.json'))) return;
    let packageData = fs.readFileSync(path.join(dir, 'package.json'), 'utf-8').toString();
    try {
        packageData = JSON.parse(packageData)
        if (!Object.keys(packageData['dependencies']).includes('react')) return;
    } catch (e) {
        return [`${errorCodePrefix}.package.IncorrectJSONSyntax`]
    }
    const filePath = path.join(dir, 'src');
    const ast = parseFile(filePath, 'index.js')
    const appAst = ast[1];
    const apiAst = ast.filter(({ loc: { filename } }) => filename.toLowerCase().endsWith('api.js'))[0]
    const mainAst = ast.filter(({ loc: { filename } }) =>
        filename.toLowerCase().endsWith('main.js') || filename.toLowerCase().endsWith('main.jsx'))[0]
    /* 1. проверяем наличие компонентов */
    const componentExistErrorsArray = ['App', 'Main', 'Footer', 'PopupWithForm', 'ImagePopup', 'Card'];
    const componentExistErrorsObject = {};
    for (const component of componentExistErrorsArray) {
        componentExistErrorsObject[component] = { id: `${errorCodePrefix}.componentNotExist`, values: { component } };
    }
    const errors = component(ast, componentExistErrorsArray, componentExistErrorsObject);
    /* 11. Проверяем запросы к API, смотрим что карточки подтянулись */
    let apiErrors = []
    evaluate(apiAst, apiErrors)
    errors.push(...apiErrors);
    /* 2. Проверяем наличие и логику обработчиков:
    handleCardClick, handleEditProfileClick, handleAddPlaceClick,handleEditAvatarClick
    Проверяем наличие конструкции fn(true) внутри обработчика,
    где fn - обязательно второй аргумент конструкции const [,] и начинается с set
    */
    errors.push(...checkLogic(appAst, ['handleAddPlaceClick', 'handleEditProfileClick'], {
        handleAddPlaceClick: `${errorCodePrefix}.AppHandlerBadLogic.handleAddPlaceClick`,
        handleEditProfileClick: `${errorCodePrefix}.AppHandlerBadLogic.handleEditProfileClick`
    }));
    /*4. В компоненте `App` также есть переменные состояния, отвечающие за видимость трёх попапов:
    isEditProfilePopupOpen
    isAddPlacePopupOpen
    isEditAvatarPopupOpen
    */
    errors.push(...checkStateVarExistence(appAst,
        {
            isEditProfilePopupOpen: `${errorCodePrefix}.AppStateBadLogic.isEditProfilePopupOpen`,
            isAddPlacePopupOpen: `${errorCodePrefix}.AppStateBadLogic.isAddPlacePopupOpen`,
            isEditAvatarPopupOpen: `${errorCodePrefix}.AppStateBadLogic.isEditAvatarPopupOpen`
        }));
    /* 3. Проверяем использование обработчиков
    Проверяем, что добавлены обработчики событий из компонента `Main` в компонент `App`.
    и что они переданы с помощью пропсов `onEditProfile`, `onAddPlace` и `onEditAvatar`.
    */
    errors.push(...checkJSXBindings(appAst, 'Main', {
        onEditProfile: 'handleEditProfileClick',
        onAddPlace: 'handleAddPlaceClick',
        onEditAvatar: 'handleEditAvatarClick',
    }, {
        onEditProfile: `${errorCodePrefix}.AppHandlerAttribute.onEditProfile`,
        onAddPlace: `${errorCodePrefix}.AppHandlerAttribute.onAddPlace`,
        onEditAvatar: `${errorCodePrefix}.AppHandlerAttribute.onEditAvatar`
    }));
    /* 5. В компоненте `PopupWithForm` есть пропc `isOpen`
    Фактически здесь проверяется, что `PopupWithForm` есть в разметке App и что у него есть атрибут isOpen
    Вернется по ошибке на каждое использование <PopupWithForm>
    */
    errors.push(...checkJSXBindings(appAst, 'PopupWithForm', {
        isOpen: '&any'
    }, {
        isOpen: `${errorCodePrefix}.PopupWithFormHandlerAttribute.isOpen`
    }));
    /*
    * 7. Проверяем есть ли логика закрытия попапов.
    Пропс `onClose` компонента `PopupWithForm` и его обработчик,
    находится он внутри `App` и называется `closeAllPopups`.
    Вернется по ошибке на каждое использование <PopupWithForm>
    */
    errors.push(...checkJSXBindings(appAst, 'PopupWithForm', {
        onClose: 'closeAllPopups'
    }, {
        onClose: `${errorCodePrefix}.PopupWithFormHandlerAttribute.closeAllPopups`
    }));
    /* 13. Проверяем значение `selectedCard` должно передаваться с помощью пропса `card` в компонент `ImagePopup`,
     где оно будет использоваться для определения наличия CSS-класса видимости
     и задания адреса изображения в теге `img`. Также у `ImagePopup` должен появиться пропс `onClose`.
     */
    errors.push(...checkJSXBindings(appAst, 'PopupWithImage', {
        onClose: 'closeAllPopups',
        card: 'selectedCard'
    }, {
        onClose: `${errorCodePrefix}.PopupWithImageHandlerAttribute.closeAllPopups`,
        card: `${errorCodePrefix}.PopupWithImageHandlerAttribute.selectedCard`
    }))
    /* 8. Есть файлы:
    src/utils/api.js
    src/utils/utils.js`
    */
    errors.push(...[path.join('utils', 'api.js'), path.join('utils', 'utils.js')]
        .filter((utilFileName) => !ast.some(({ loc: { filename } }) => filename.toLowerCase().endsWith(utilFileName)))
        .map((utilFileName) => ({ id: `${errorCodePrefix}.fileNotFound`, values: { file: utilFileName } })))
    /* 9. Внутри `api.js` есть экземпляр класса `Api` с нужными параметрами, токен не проверяем
    Неизвестно что значит "нужные параметры", так что проверим что в этот класс вообще хоть что-то передаётся
    */
    errors.push(...checkApiInstance(apiAst) === null ? [`${errorCodePrefix}.instanceIsNotExported`] : []);
    /*10. В компоненте `Main` есть переменные состояния `userName`, `userDescription` и `userAvatar`. */

    errors.push(...checkStateVarExistence(mainAst, {
        userName: `${errorCodePrefix}.MainStateVarIsNotFound.userName`,
        userDescription: `${errorCodePrefix}.MainStateVarIsNotFound.userDescription`,
        userAvatar: `${errorCodePrefix}.MainStateVarIsNotFound.userAvatar`
    }));
    /* 12. Проверяем в компоненте `App` стейт-переменную `selectedCard`.
    Значение этой переменной должно задаваться из нового обработчика `handleCardClick`
    и сбрасываться из уже существующего `closeAllPopups`.
    */
    errors.push(...checkSelectedCard(appAst, 'handleCardClick', 'closeAllPopups', {
        handleCardClick: `${errorCodePrefix}.CardClick.Handler`,
        handleClosePopups: `${errorCodePrefix}.CardClick.CommonPopupHandler`,
    }));

    return errors
}
const parseFile = (base, fileName, astArr = []) => {
    const filePath = path.resolve((path.join(base, fileName)));
    const content = fs.readFileSync(filePath, 'utf8');
    const ast = parser.parse(content, {
        errorRecovery: true,
        sourceType: 'unambiguous',
        sourceFilename: filePath,
        plugins: ['jsx', 'classProperties']
    })
    astArr.push(ast)
    traverse.default(ast, {
        ImportDeclaration: function ({ node: { source: { value } } }) {
            if (importBlockList.includes(value)) return
            if (!value.endsWith('.css') && !value.endsWith('.svg')) {
                if (value.endsWith('.jsx') || value.endsWith('.js')) {
                    astArr = parseFile(path.dirname(filePath), value, astArr)
                } else {
                    astArr = parseFile(path.dirname(filePath), value + '.js', astArr)
                }
            }
        }
    })
    return astArr
}


