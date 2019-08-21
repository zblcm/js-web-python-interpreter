let Parser = require("jison").Parser;
let fs = require("fs");
/*
let python_l = fs.readFileSync('./grammar/python.l').toString("utf8");
let python_y = fs.readFileSync('./grammar/python.y').toString("utf8");
let grammar = python_l + python_y;
let parser = new Parser(grammar);
*/
let python_y = fs.readFileSync('./grammar/python.y').toString("utf8");
let parser = new Parser(python_y);

let data = parser.generate({
    moduleName: "python_parse_raw"
});
fs.writeFile('./src/python.js', data, (err) => {
    if (err) throw err;
    console.log('./src/python.js has been saved!');
});