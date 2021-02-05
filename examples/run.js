const cp = require('child_process');
const chai = require('chai');
const diff = require('diff');

const tests = require('./test_desc.js');
const getArrFromStr = require('./getArrFromStr.js');

console.log('проваленные тесты (всё ок если пусто):');

for (let test of tests) {
    cp.exec(test.cmd, { cwd: __dirname }, (error, stdout, stderr) => {
        try {
            chai.expect(getArrFromStr(stdout)).to.deep.equal(test.res);
        } catch (error) {
            console.log(diff.createPatch(test.desc,
                JSON.stringify(error.expected, null, '    '),
                JSON.stringify(error.actual, null, '    '),
                'ожидалось',
                'получили'));
        }
    });
}