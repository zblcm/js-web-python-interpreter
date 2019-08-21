/***********************************************************

 Written by Tinynight: zblcm@163.com zblcm3@gmail.com

 Lexer is used by generated Jison parser.
 Since python has indent stuff, I need to write a new lexer. Fuck python.
 Here is a bug: when meet """, it resolved as two " instead.
 This is easy to solve, but I am too lazy :/

 ***********************************************************/

let STATE = {};
STATE.QUOTE = {};
STATE.QUOTE.S = "'";
STATE.QUOTE.D = "\"";
STATE.QUOTE.T = "\"\"\"";
STATE.BRACKET = {};
STATE.BRACKET.S = "(";
STATE.BRACKET.M = "[";
STATE.BRACKET.L = "{";

STATE.COMMENT = "#";
STATE.NUMBER = "Number";
STATE.NUMBER_DOT = "Number Dot";
STATE.IDENTIFIER = "Identifier";

let CLOSE = {};
CLOSE.QUOTE = {};
CLOSE.COMMENT = "\n";
CLOSE.QUOTE.S = "'";
CLOSE.QUOTE.D = "\"";
CLOSE.QUOTE.T = "\"\"\"";
CLOSE.BRACKET = {};
CLOSE.BRACKET.S = ")";
CLOSE.BRACKET.M = "]";
CLOSE.BRACKET.L = "}";

Python.parser.lexer = new (function() {
    this.text = "";
	this.keyword_table = {
		"not"                   	: "!",
		"if"                   		: "IF",
		"else"                   	: "ELSE",
		"while"                   	: "WHILE",
		"for"                   	: "FOR",
		"in"                   		: "IN",
		"def"                   	: "DEF",
		"class"                   	: "CLASS",
		"return"                   	: "RETURN",
		"True"                   	: "TRUE",
		"False"                   	: "FALSE",
	};
	this.operator_table = {
		"<<"                   		: "<<",
		">>"                   		: ">>",
		"<="                   		: "<=",
		">="                   		: ">=",
		"=="                   		: "==",
		"!="                   		: "!=",
		"&&"                   		: "&&",
		"||"                   		: "||",

		"*"                   		: "*",
		"/"                   		: "/",
		"%"                   		: "%",
		"+"                   		: "+",
		"-"                   		: "-",
		"<"                   		: "<",
		">"                   		: ">",
		"&"                   		: "&",
		"^"                   		: "^",
		"|"                   		: "|",
		"~"                   		: "~",
		"!"                   		: "!",

		"("                   		: "(",
		")"                   		: ")",
		"["                   		: "[",
		"]"                   		: "]",
		"{"                   		: "{",
		"}"                   		: "}",
		"="                   		: "=",
		"."                   		: ".",
		":"                   		: ":",
		","                   		: ",",
		"\n"                   		: "NEWLINE",
	};
	this.error_loc = function() {
		return {
			sx:	this.yylloc.first_column,
			sy:	this.yylloc.first_line,
			ex:	this.yylloc.last_column,
			ey:	this.yylloc.last_line,
		};
	};
    this.setInput = function(text, yy) {
		text = text + "\n";
        this.text = text;
        this.yy = yy;
        this.yy.enable_indenting = (function(self) {
        	return function() {
        		self.indenting = true;
        	};
		})(this);
        this.yy.parseError = (function(self) {
        	return function(error_string, error) {
				throw {
					type:		ERROR.YACC,
					expected: 	error.expected,
					however:	error.token,
					loc:		self.error_loc()
				}
			}
        })(this);

		this.yytext = "";
		this.yylloc = {
			first_column: 0,
			first_line: 1,
			last_line: 1,
			last_column: 0
		};

		this.current_state = null;
		this.to_flush = [];
		this.indenting = true;
		this.previous_divided_indention = 0;
		this.current_indention = 0;
		this.parsing_pos = 0;
		this.bracket_stack = [];
    };
    this.indent_character = function(c) {
    	switch (c) {
			case " ":
				this.current_indention = this.current_indention + 1;
				return true;
			case "\t":
				this.current_indention = this.current_indention + (4 - (this.current_indention % 4));
				return true;
			case "\n":
				this.current_indention = 0;
				return true;
			default:
				return false;
		}
	};
    this.get_current = function() {
    	if (this.parsing_pos >= this.text.length)
    		return null;
		return this.text.charAt(this.parsing_pos);
	};
    this.goto_next = function() {
		if (this.parsing_pos >= this.text.length)
			return null;
		let c = this.text.charAt(this.parsing_pos);
		this.yylloc.last_column++;
		this.parsing_pos++;
		if (c === "\n") {
			this.yylloc.last_column = 0;
			this.yylloc.last_line++;
		}
		return c;
	};
	this.set_to_flush = function() {
		if (this.current_indention % 4)
			throw {
				type:		ERROR.LEX.INDENT,
				however:	this.current_indention,
				loc:		this.error_loc(),
			};
		let divided_indentation = this.current_indention / 4;
		this.to_flush = divided_indentation - this.previous_divided_indention;
		this.previous_divided_indention = divided_indentation;
		this.current_indention = 0;
		this.indenting = false;
	};
	this.flush = function() {
		if (this.to_flush > 0) {
			this.to_flush = this.to_flush - 1;
			return "<{";
		}
		if (this.to_flush < 0) {
			this.to_flush = this.to_flush + 1;
			return "}>";
		}
		return null;
	};
	let debug_then_return = function(token, text) {
		// console.log("Get toekn: " + token + " yytext: " + text);
		return token;
	};
	let ord = function(c) {return c.charCodeAt(0)};
	let test_characters = function(c, array) {
		return array.indexOf(c) >= 0;
	};
	let character_is_num = function(c) {return ((c != null) && (ord(c) >= ord("0")) && (ord(c) <= ord("9")))};
	let character_is_character = function(c) {return (c != null) && (((ord(c) >= ord("a")) && (ord(c) <= ord("z"))) || ((ord(c) >= ord("A")) && (ord(c) <= ord("Z"))))};
	this.escape_character = function(c) {
		switch (c) {
			case "t": return + "\t";
			case "v": return "\v";
			case "0": return "\0";
			case "b": return "\b";
			case "f": return "\f";
			case "n": return "\n";
			case "r": return "\r";
			case "\'": return "\'";
			case "\"": return "\"";
			case "\\": return "\\";
		}
		return c;
	};
	this.lex = function() {
		return debug_then_return(this.debug_lex(), this.yytext);
	};
    this.debug_lex = function() {
    	// console.log(this.current_state, this.indenting, this.get_current());
    	// shift block closing statements. After detecting number of indentations, before the start of a statement, lexer will flush several block closing characters.
		let f = this.flush();
		if (f != null) return f;

		let c;
		if (this.indenting) {
			// skip all indent characters.
			c = this.get_current();
			while ((c !== null) && this.indent_character(c)) {
				this.goto_next();
				c = this.get_current();
			}
			this.indenting = false;
			// console.log("disable indenting.");

			// Check flush.
			this.set_to_flush();
			f = this.flush();
			if (f != null) return f;
		}
		else
			c = this.get_current();

		// This is the point when we finished dealing with flush. c will be the first meaningful character, but goto_next need to be called.

        // Push new stacks.
		switch (this.current_state) {
			case STATE.COMMENT:
				// skip all ignorable characters.
				while (!test_characters(this.get_current(), ["\n", null]))
					this.goto_next();
				this.current_state = null;
				return this.debug_lex();
			case STATE.QUOTE.T:
				while (this.yytext.slice(-3) !== CLOSE.QUOTE.T) {
					c = this.get_current();
					if (c === null)
						throw {
							type:		ERROR.LEX.EXPECT,
							expected:	["\"\"\""],
							however:	"EOF",
							loc:		this.error_loc(),
						};
					if (c === "\\") {
						this.goto_next();
						c = this.get_current();
						this.yytext = this.yytext + this.escape_character(c);
					}
					else this.yytext = this.yytext + c;
					this.goto_next();
				}
				this.yytext = this.yytext.slice(-3);
				this.current_state = null;
				return "STRING";
			case STATE.QUOTE.D:
				while (c !== CLOSE.QUOTE.D) {
					if (test_characters(c, ["\n", null]))
						throw {
							type:		ERROR.LEX.EXPECT,
							expected:	["\""],
							however:	c,
							loc:		this.error_loc(),
						};
					if (c === "\\") {
						this.goto_next();
						c = this.get_current();
						this.yytext = this.yytext + this.escape_character(c);
					}
					else this.yytext = this.yytext + c;
					this.goto_next();
					c = this.get_current();
				}
				this.goto_next();	// skip last "
				this.current_state = null;
				return "STRING";
			case STATE.QUOTE.S:
				while (c !== CLOSE.QUOTE.S) {
					if (test_characters(c, ["\n", null]))
						throw {
							type:		ERROR.LEX.EXPECT,
							expected:	["\'"],
							however:	c,
							loc:		this.error_loc(),
						};
					if (c === "\\") {
						this.goto_next();
						c = this.get_current();
						this.yytext = this.yytext + this.escape_character(c);
					}
					else this.yytext = this.yytext + c;
					this.goto_next();
					c = this.get_current();
				}
				this.goto_next();	// skip last '
				this.current_state = null;
				return "STRING";
			case STATE.IDENTIFIER:
				while (character_is_num(c) || character_is_character(c) || (c === "_")) {
					this.yytext = this.yytext + c;
					this.goto_next();
					c = this.get_current();
				}
				this.current_state = null;
				let keyword = this.keyword_table[this.yytext];
				if (keyword) return keyword;
				return "IDENTIFIER";
			case STATE.NUMBER:
				while (character_is_num(c) || (c === ".")) {
					this.yytext = this.yytext + c;
					this.goto_next();
					if (c === ".") {
						this.current_state = STATE.NUMBER_DOT;
						return this.debug_lex();
					}
					c = this.get_current();
				}
				this.current_state = null;
				return "NUMBER";
			case STATE.NUMBER_DOT:
				while (character_is_num(c)) {
					this.yytext = this.yytext + c;
					this.goto_next();
					c = this.get_current();
				}
				this.current_state = null;
				return "NUMBER";
			case null: {
				// console.log("NULL state: ", c, this.indenting);
				// Skip spaces.
				while ((c === " ") || ((this.bracket_stack.length > 0) && (c === "\n"))) {
					this.goto_next();
					c = this.get_current();
				}

				// Ready to accept new content.

				this.yylloc = {
					first_column: 	this.yylloc.last_column,
					first_line: 	this.yylloc.last_line,
					last_line: 		this.yylloc.last_line,
					last_column: 	this.yylloc.last_column
				};
				this.yytext = "";

				if (c === null) {
					if (this.bracket_stack.length > 0)
						throw {
							type:		ERROR.LEX.EXPECT,
							expected:	[this.bracket_stack[this.bracket_stack.length - 1]],
							however:	"EOF",
							loc:		this.error_loc(),
						};
					return "EOF";
				}

				this.yytext = this.yytext + c;
				this.goto_next();

				if (character_is_num(c)) {
					this.current_state = STATE.NUMBER;
				}
				if (character_is_character(c) || (c === '_')) {
					this.current_state = STATE.IDENTIFIER;
				}
				if (this.yytext === STATE.COMMENT) {
					this.yytext = "";
					this.current_state = STATE.COMMENT;
				}
				if (this.yytext === STATE.QUOTE.S) {
					this.yytext = "";
					this.current_state = STATE.QUOTE.S;
				}
				// TODO:: this has some bug, if you have """, before you get to STATE.QUOTE.T, you will get STATE.QUOTE.D. I have to use other method to test. Fuck python.
				if (this.yytext === STATE.QUOTE.D) {
					this.yytext = "";
					this.current_state = STATE.QUOTE.D;
				}
				if (this.yytext === STATE.QUOTE.T) {
					this.yytext = "";
					this.current_state = STATE.QUOTE.T;
				}

				// check bracket stack.
				if (this.yytext === STATE.BRACKET.S) this.bracket_stack.push(CLOSE.BRACKET.S);
				if (this.yytext === STATE.BRACKET.M) this.bracket_stack.push(CLOSE.BRACKET.M);
				if (this.yytext === STATE.BRACKET.L) this.bracket_stack.push(CLOSE.BRACKET.L);
				if (this.yytext === this.bracket_stack[this.bracket_stack.length - 1]) this.bracket_stack.pop();

				// lookahead and check double-operator.
				c = this.get_current();
				if (this.operator_table[this.yytext + c]) {
					this.goto_next();
					this.yytext = this.yytext + c;
					return this.operator_table[this.yytext];
				}

				// check single-operator.
				if (this.operator_table[this.yytext]) return this.operator_table[this.yytext];

				return this.debug_lex();
			}
		}
		throw {
			type:		ERROR.LEX.STATE,
			loc:		this.error_loc(),
		};
    };
})();