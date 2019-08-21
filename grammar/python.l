%lex

%%

"not"                   	return "!";
"if"                   		return "IF";
"else"                   	return "ELSE";
"while"                   	return "WHILE";
"for"                   	return "FOR";
"in"                   		return "IN";
"def"                   	return "DEF";
"class"                   	return "CLASS";
"return"                   	return "RETURN";
"True"                   	return "TRUE";
"False"                   	return "FALSE";

\"((\\\")|[^\"])*\"  		return "STRING";
\'((\\\')|[^\'])*\'  		return "STRING";
[0-9]+("."[0-9]+)?\b  		return "NUMBER";
[a-z|A-Z][a-z|A-Z|0-9]*\b  	return "INENTIFIER";

"<<"                   		return "<<";
">>"                   		return ">>";
"<="                   		return "<=";
">="                   		return ">=";
"=="                   		return "==";
"!="                   		return "!=";
"&&"                   		return "&&";
"||"                   		return "||";

"*"                   		return "*";
"/"                   		return "/";
"%"                   		return "%";
"+"                   		return "+";
"-"                   		return "-";
"<"                   		return "<";
">"                   		return ">";
"&"                   		return "&";
"^"                   		return "^";
"|"                   		return "|";
"~"                   		return "~";
"!"                   		return "!";

"("                   		return "(";
")"                   		return ")";
"["                   		return "[";
"]"                   		return "]";
"{"                   		return "{";
"}"                   		return "}";
"="                   		return "=";
"."                   		return ".";
":"                   		return ":";
","                   		return ",";
<<EOF>>              		return "EOF";

\s+                   		/* skip whitespace */

/lex

