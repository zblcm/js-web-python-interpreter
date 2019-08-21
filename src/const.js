let NODE = {};

NODE.EXPRESSION = {};
NODE.EXPRESSION.ASSIGNMENT  = "expression_assignment";
NODE.EXPRESSION.TERNARY     = "expression_ternary";
NODE.EXPRESSION.BINARY      = "expression_binary";
NODE.EXPRESSION.UANRY       = "expression_unary";
NODE.EXPRESSION.REFERENCE   = "expression_reference";
NODE.EXPRESSION.VALUE       = "expression_value";
NODE.EXPRESSION.CALL        = "expression_call";
NODE.EXPRESSION.FUNCTION    = "expression_function";
NODE.EXPRESSION.CLASS       = "expression_class";
NODE.EXPRESSION.ARRAY       = "expression_array";
NODE.EXPRESSION.OBJECT      = "expression_object";

NODE.STATEMENT = {};
NODE.STATEMENT.EXPRESSION   = "statement_expression";
NODE.STATEMENT.IF           = "statement_if";
NODE.STATEMENT.WHILE        = "statement_while";
NODE.STATEMENT.FOR          = "statement_for";
NODE.STATEMENT.RETURN       = "statement_return";
NODE.STATEMENT.BLOCK        = "statement_block";

let TYPE = {};
TYPE.BOOLEAN 	= "boolean";
TYPE.NUMBER 	= "number";
TYPE.STRING 	= "string";
TYPE.FUNCTION 	= "function";
TYPE.CLASS 		= "class";
TYPE.NULL 		= "null";
TYPE.ARRAY 		= "array";
TYPE.OBJECT 	= "object";

let ERROR = {};
ERROR.LEX = {};
ERROR.LEX.INDENT            = "lex indent";
ERROR.LEX.EXPECT            = "lex expect";
ERROR.LEX.STATE             = "lex state";

ERROR.RUNTIME = {};
ERROR.RUNTIME.TYPE          = "runtime type";
ERROR.RUNTIME.BINARY        = "runtime binary";
ERROR.RUNTIME.UNARY         = "runtime unary";
ERROR.RUNTIME.INTERRUPT     = "runtime interrupt";
ERROR.RUNTIME.REFERENCE     = "runtime reference";
ERROR.RUNTIME.NUM_ARG       = "runtime num arg";
ERROR.RUNTIME.UNKNOWN_NODE  = "runtime unknown node";
ERROR.RUNTIME.JAVASCRIPT    = "runtime javascript";

ERROR.YACC                  = "yacc";