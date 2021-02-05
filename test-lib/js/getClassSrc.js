const tokenizer = require("./tokenizer");

module.exports = (content, className) => {
    const contentTokenizer = new tokenizer.Tokenizer(content, { range: true });
    let bal = 0;
    let prev = {};
    let classStart = -1;
    while (true) {
        const token = contentTokenizer.getNextToken();
        if (!token) {
            break;
        }
        if (token.type === 'Identifier' && token.value === className && prev.type === 'Keyword' && prev.value === 'class') {
            classStart = prev.range[0];
            bal = 0;
        }
        if (token.type === 'Punctuator') {
            if (token.value === '{') {
                bal++;
            }
            if (token.value === '}') {
                bal--;
                if (classStart >= 0 && bal === 0) {
                    return content.substring(classStart, token.range[1]);
                }
            }
        }
        prev = token;
    }
}