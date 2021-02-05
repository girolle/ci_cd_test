const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const esquery = require('esquery');

if (process.argv.length < 3) {
   //throw new Error('usage: node run.js "projectPath"');
   process.argv[2] = 'C:\\Users\\kulik-alex\\Desktop\\git\\local-tests-lib\\examples_del\\canonical_ru-en_sprint11-master';
}
const projectPath = path.normalize(process.argv[2]);
const console_log = console.log;
const json_log = json => console_log(JSON.stringify(json, null, '    '));

console.log = () => 0;

const getAst = (...args) => {
   const filePath = path.join(...args);
   const content = fs.readFileSync(filePath, 'utf8');
   const ast = parser.parse(content, {
      errorRecovery: true,
      sourceType: 'unambiguous',
      sourceFilename: filePath,
      plugins: ['jsx', 'classProperties']
   });
   return ast;
}

const errors = [];
//1. HTML, CSS, JS-файлы и изображения должны быть в папке src. ??HTML в public
require('./checkFileTypes.js')(path.join(projectPath, 'src'), 'src', errors);
//2. Сборка и запуск выполняются без ошибок. ??тренажер

/**
 * 3. В проекте есть:
    - файлы index.html, index.css;
    - директория blocks;
    - директория components с файлами App.js, Card.js, ImagePopup.js, PopupWithForm.js, Main.js, Header.js, Footer.js, AddPlacePopup.js, EditAvatarPopup.js, EditProfilePopup.js;
    - директория utils с файлами api.js и utils.js;
    - директория contexts с файлом CurrentUserContext.js;
    - файл README.md,
    - файл .gitignore.
 */
require('./checkFileExist.js')(projectPath, '', errors);
/**
 * 5. Создана глобальная стейт-переменная currentUser с помощью createContext.
 */
try {
   const ast = getAst(projectPath, 'src', 'contexts', 'CurrentUserContext.js');
   const res = esquery.query(ast, 'CallExpression [name=createContext]');
   if (res.length === 0) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.CurrentUserContext' });
}
/**
 * 6. Разметка портирована в JSX:
    - Разметка заключена в ( );
    - Разметка вынесена в соответствующие ей компоненты.
 */
try {
   const files = ['App.js', 'Card.js', 'ImagePopup.js', 'PopupWithForm.js',
      'Main.js', 'Header.js', 'Footer.js', 'AddPlacePopup.js', 'EditAvatarPopup.js',
      'EditProfilePopup.js'].map(x => ['src', 'components', x]);
   for (const relFileName of files) {
      const ast = getAst(projectPath, ...relFileName);
      const res = esquery.query(ast, 'ReturnStatement JSXElement');
      if (res.length === 0) { throw new Error(); }
   }
} catch {
   errors.push({ id: 'student_web_project_error.11.ReturnJSX' });
}
/**
 * 7. Хуки не используются внутри условных блоков;
 */
try {
   const files = ['App.js', 'Card.js', 'ImagePopup.js', 'PopupWithForm.js',
      'Main.js', 'Header.js', 'Footer.js', 'AddPlacePopup.js', 'EditAvatarPopup.js',
      'EditProfilePopup.js'].map(x => ['src', 'components', x]);
   for (const relFileName of files) {
      const ast = getAst(projectPath, ...relFileName);
      const res = esquery.query(ast, '[type=/IfStatement|ConditionalExpression/] CallExpression [name=/useState|useEffect/]');
      if (res.length > 0) { throw new Error(); }
   }
} catch {
   errors.push({ id: 'student_web_project_error.11.IFuseState' });
}
/**
 * 8. Хуки вызываются в основной функции компонента;
 */
try {
   const files = ['App.js', 'Card.js', 'ImagePopup.js', 'PopupWithForm.js',
      'Main.js', 'Header.js', 'Footer.js', 'AddPlacePopup.js', 'EditAvatarPopup.js',
      'EditProfilePopup.js'].map(x => ['src', 'components', x]);
   for (const relFileName of files) {
      const ast = getAst(projectPath, ...relFileName);
      const res = esquery.query(ast, 'CallExpression [name=/useState|useEffect/]');
      if (res.length > 0) {
         const res = esquery.query(ast, '.body CallExpression [name=/useState|useEffect/]');
         if (res.length === 0) {
            throw new Error();
         }
      }
   }
} catch {
   errors.push({ id: 'student_web_project_error.11.BODYuseState' });
}
/**
 * 9. При использовании классовых компонентов эффекты описаны внутри методов жизненного цикла компонента.
 */
/**
 * 10. Компоненты Main и Card подписаны на контекст CurrentUserContext.
 */
try {
   const ast = getAst(projectPath, 'src', 'components', 'Main.js');
   const res = esquery.query(ast, 'CallExpression [name=useContext]');
   if (res.length === 0) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.useContext', values: { component: 'Main' } });
}
try {
   const ast = getAst(projectPath, 'src', 'components', 'Card.js');
   const res = esquery.query(ast, 'CallExpression [name=useContext]');
   if (res.length === 0) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.useContext', values: { component: 'Card' } });
}
/**
 * 11. Выполнено поднятие стейта из компонент Main и Card.
 */
try {
   const ast = getAst(projectPath, 'src', 'components', 'App.js');
   const res = esquery.query(ast, 'JSXOpeningElement:has([name=Main]) .attributes');
   if (res.length < 5) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.state', values: { component: 'Card' } });
}
try {
   const ast = getAst(projectPath, 'src', 'components', 'Main.js');
   const res = esquery.query(ast, 'JSXOpeningElement:has([name=Card]) .attributes');
   if (res.length < 3) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.state', values: { component: 'Card' } });
}
/**
 * 12. В компонент App внедрён контекст через CurrentUserContext.Provider.
 */
try {
   const ast = getAst(projectPath, 'src', 'components', 'App.js');
   const res = esquery.query(ast, 'JSXOpeningElement:has([name=Provider])');
   if (res.length === 0) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.Provider' });
}
/**
 * 13. В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
 */
try {
   const ast = getAst(projectPath, 'src', 'components', 'App.js');
   const res = esquery.query(ast, 'JSXOpeningElement:has([name=Provider]) JSXAttribute:has([name=value]) .value');
   const res2 = esquery.query(ast, 'VariableDeclaration:has([name=' + res[0].expression.name + ']):has(CallExpression [name=useState])');
   if (res.length === 0) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.currentUser' });
}
/**
 * 14. Компоненты модальных окон содержат только обработчики сабмита формы. Остальные обработчики, например handleUpdateUser, описаны в компоненте App.
 */
try {
   const ast = getAst(projectPath, 'src', 'components', 'AddPlacePopup.js');
   const res = esquery.query(ast, '[type=/Function/]');
   if (res.length > 3) { throw new Error(); }
} catch {
   errors.push({ id: 'student_web_project_error.11.submitOnly' });
}
/**
 * 15. Запросы к API описаны внутри компонента App.
 */
/**
 * 16. Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
 */
json_log(errors);