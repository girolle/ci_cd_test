const tests = [];
const add = (folder, desc, res) => {
    tests.push({ cmd: 'node ../run.js ' + folder, desc: `(${folder}) ${desc}`, res });
}
add('0', 'блок с модификатором', [[], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('1', 'Разный формат в локальной библиотеке htmlhint и библиотеке Яндекса.', [
    [
        {
            values: {
                fileName: "index.html",
                line: 110,
                column: 9
            },
            id: "htmlhint.tag-pair"
        }, {
            values: {
                fileName: "index.html", line: 123, column: 9
            }, id: "htmlhint.tag-pair"
        }
    ], [{ "id": "student_web_project_error.ApiClassNotFound" }], [
        {
            id: "stylelint.plugin/no-duplicate-properties-in-media",
            values: { fileName: "blocks\\kaufman\\kaufman.css", line: 8, column: 5 }
        }, {
            id: "stylelint.plugin/no-duplicate-properties-in-media",
            values: { fileName: "blocks\\kaufman\\kaufman.css", line: 9, column: 5 }
        },
        {
            id: "stylelint.declaration-block-no-duplicate-properties",
            values: { fileName: "blocks\\kaufman\\kaufman.css", line: 8, column: 5 }
        }, {
            id: "stylelint.declaration-block-no-duplicate-properties",
            values: { "fileName": "blocks\\kaufman\\kaufman.css", line: 9, column: 5 }
        }, {
            id: "stylelint.declaration-block-semicolon-newline-after",
            values: { fileName: "blocks\\logo\\_place\\logo_place_header.css", line: 4, column: 15 }
        }
    ]
]);
add('2', 'правильно: блок вместе с элементом', [[], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('3', 'неправильно: элемент без блока', [
    [
        {
            id: "не бэм",
            values: {
                class: "logo_place_header",
                line: 10,
                col: 5,
                fileName: "index.html"
            }
        }
    ], [{ "id": "student_web_project_error.ApiClassNotFound" }], []
]);
add('4', 'чтоб не падало', [[{
    id: "не бэм",
    values: {
        class: "block_mod_val_1",
        line: 9,
        col: 5,
        fileName: "index.html"
    }
}], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('5', 'чтоб не падало', [[{
    id: "не бэм",
    values: {
        class: "block__elem__elem__elem",
        line: 10,
        col: 9,
        fileName: "index.html"
    }
}], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('6', 'только одно сообщение 1', [[{ id: 'не бэм', values: { class: "block__elem_mod_val", line: 9, col: 5, fileName: "index.html" } }], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('7', 'только одно сообщение 2', [[{ id: 'не бэм', values: { class: "block__elem_mod_val", line: 10, col: 9, fileName: "index.html" } }], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('8', 'только одно сообщение 3', [[{ id: 'не бэм', values: { class: "block__elem_mod_val", line: 9, col: 5, fileName: "index.html" } }], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('9', 'только одно сообщение 4', [[{ id: 'не бэм', values: { class: "block__elem", line: 9, col: 5, fileName: "index.html" } }], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('10', 'незакрытый тег', [[{
    "values": {
        "fileName": "index.html",
        "line": 10,
        "column": 99
    },
    "id": "htmlhint.tag-pair"
}], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('11', 'css!important', [[{ "id": "student_web_project_error.ApiClassNotFound" }], [{ id: "stylelint.declaration-no-important", values: { fileName: "style.css", line: 2, column: 29 } }]]);
add('12', 'svg', [[{ id: "student_web_project_error.svg", values: { fileName: "index.html" } }], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
add('13', 'ложное срабатывание на шрифты', [[{ "id": "student_web_project_error.ApiClassNotFound" }], [{ id: "stylelint.plugin/no-duplicate-properties-in-media", values: { fileName: "vendor\\fonts\\fonts.css", line: 33, column: 3 } }]]);
add('14', 'проверка Api класса', [[], []]);
add('15', 'проверка на лишние бэм ошибки', [[{
    id: "не бэм",
    values: { class: "two-colomns__main-text", line: 25, col: 11, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 16, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 79, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 138, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 139, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 140, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 146, fileName: "index.html" }
},
{
    id: "student_web_project_error.emptyTarget",
    values: { line: 147, fileName: "index.html" }
}, {
    id: "student_web_project_error.emptyTarget",
    values: { line: 148, fileName: "index.html" }
}], [{ "id": "student_web_project_error.ApiClassNotFound" }], []]);
module.exports = tests;