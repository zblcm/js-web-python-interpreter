%start start_node

%% /* language grammar */

start_node
    : list_statement EOF {
		return $1;
	}
    ;
	
identifier
	: IDENTIFIER {
		$$ = yytext;
	}
	;
	
number
	: NUMBER {
		$$ = Number(yytext);
	}
	;
	
string
	: STRING {
		$$ = yytext;
	}
	;

operator_binary_00 	: "*" 	| "/" 	| "%"	;
operator_binary_01 	: "+" 	| "-" 	;
operator_binary_02 	: "<<" 	| ">>" 	;
operator_binary_03 	: "<" 	| ">" 	| "<=" 	| ">=" 	;
operator_binary_04 	: "==" 	| "!=" 	;
operator_binary_05 	: "&" 	;
operator_binary_06 	: "^" 	;
operator_binary_07 	: "|" 	;
operator_binary_08 	: "&&" 	;
operator_binary_09 	: "||" 	;
operator_unary 		: "~" 	| "!" 	;

expression : expression_assignment;

expression_assignment : expression_ternary
	| expression_reference "=" expression {
		$$ = {
			type: "expression_assignment",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			reference: $1,
			expression: $3
		};
	}
	;
	
expression_ternary : expression_binary_09
	| expression_binary_09 "?" expression_binary_09 ":" expression_binary_09 {
		$$ = {
			type: "expression_ternary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			t0: $1,
			t1: $3,
			t2: $5
		};
	};

expression_binary_09 : expression_binary_08 |
	expression_binary_09 operator_binary_09 expression_binary_08 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_08 : expression_binary_07 |
	expression_binary_08 operator_binary_08 expression_binary_07 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_07 : expression_binary_06 |
	expression_binary_07 operator_binary_07 expression_binary_06 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_06 : expression_binary_05 |
	expression_binary_06 operator_binary_06 expression_binary_05 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_05 : expression_binary_04 |
	expression_binary_05 operator_binary_05 expression_binary_04 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_04 : expression_binary_03 |
	expression_binary_04 operator_binary_04 expression_binary_03 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_03 : expression_binary_02 |
	expression_binary_03 operator_binary_03 expression_binary_02 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_02 : expression_binary_01 |
	expression_binary_02 operator_binary_02 expression_binary_01 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_01 : expression_binary_00 |
	expression_binary_01 operator_binary_01 expression_binary_00 {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_binary_00 : expression_unary |
	expression_binary_00 operator_binary_00 expression_unary {
		$$ = {
			type: "expression_binary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $2,
			t0: $1,
			t1: $3
		};
	};
expression_unary : expression_piority |
	operator_unary expression_unary {
		$$ = {
			type: "expression_unary",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			op: $1,
			t0: $2
		};
	};
	
expression_piority
	: "(" expression ")" {
		$$ = $2;
	}
	| expression_reference
	| expression_value
	| expression_new
	| expression_call
	;

expression_reference
	: expression_piority "." identifier {
		$$ = {
			type: "expression_reference",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			subject: $1,
			field: {
				type: "expression_value",
				loc_sx: @3.first_column,
				loc_sy: @3.first_line,
				loc_ex: @3.last_column,
				loc_ey: @3.last_line,
				value_type: "string",
				value: $3
			}
		};
	}
	| expression_piority "[" expression "]" {
		$$ = {
			type: "expression_reference",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			subject: $1,
			field: $3
		};
	}
	| identifier {
		$$ = {
			type: "expression_reference",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			subject: null,
			field: {
				type: "expression_value",
				loc_sx: @1.first_column,
				loc_sy: @1.first_line,
				loc_ex: @1.last_column,
				loc_ey: @1.last_line,
				value_type: "string",
				value: $1
			}
		};
	}
	;
	
expression_value
	: number {
		$$ = {
			type: "expression_value",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			value_type: "number",
			value: Number($1)
		}
	}
	| string {
		$$ = {
			type: "expression_value",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			value_type: "string",
			value: $1.toString()
		}
	}
	| TRUE {
		$$ = {
			type: "expression_value",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			value_type: "boolean",
			value: true
		}
	}
	| FALSE {
		$$ = {
			type: "expression_value",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			value_type: "boolean",
			value: false
		}
	}
	;
expression_new
	: expression_array
	| expression_object
	;
expression_array
	: "[" list_expression "]" {
		$$ = {
			type: "expression_array",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			expressions: $2
		}
	}
	;
expression_object
	: "{" list_kvpair "}" {
		$$ = {
			type: "expression_object",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			kvpairs: $2
		}
	}
	;
expression_call
	: expression_piority "(" list_expression ")" {
		$$ = {
			type: "expression_call",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			subject: $1,
			arguments: $3
		}
	}
	;
statement
	: statement_expression  end_of_statement {$$ = $1;}
	| statement_if
	| statement_while
	| statement_for
	| statement_def
	| statement_class
	| statement_return      end_of_statement {$$ = $1;}
	;
end_of_statement :
    end_of_statement_2 NEWLINE
;
end_of_statement_2 :
    { /*console.log("end of statement.");*/ yy.enable_indenting(); }
;
statement_expression
	: expression {
		$$ = {
			type: "statement_expression",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			expression: $1
		}
	}
	;
statement_if
	: IF expression ":" end_of_statement block_statements {
		$$ = {
			type: "statement_if",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			condition: $2,
			operation_then: $5,
			operation_else: null
		}
	}
	| IF expression ":" end_of_statement block_statements ELSE ":" end_of_statement block_statements {
		$$ = {
			type: "statement_if",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			condition: $2,
			operation_then: $5,
			operation_else: $9
		}
	}
	;
statement_while
	: WHILE expression ":" end_of_statement block_statements {
		$$ = {
			type: "statement_while",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			condition: $2,
			operation: $5
		}
	}
	;
statement_for
	: FOR expression_reference IN expression ":" end_of_statement block_statements {
		$$ = {
			type: "statement_for",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			variable: $2,
			container: $4,
			operation: $7
		}
	}
	;
statement_def
	: DEF identifier "(" list_identifier ")" ":" end_of_statement block_statements {
		$$ = {
			type: "expression_assignment",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			reference: {
			    type: "expression_reference",
				loc_sx: @2.first_column,
				loc_sy: @2.first_line,
				loc_ex: @2.last_column,
				loc_ey: @2.last_line,
			    subject: null,
				field: {
					type: "expression_value",
					loc_sx: @2.first_column,
					loc_sy: @2.first_line,
					loc_ex: @2.last_column,
					loc_ey: @2.last_line,
					value_type: "string",
					value: $2
				}
			},
			expression: {
				type: "expression_function",
				loc_sx: @4.first_column,
				loc_sy: @4.first_line,
				loc_ex: @4.last_column,
				loc_ey: @4.last_line,
				arguments: $4,
				operation: $8
			}
		};
	}
	;
statement_class
	: CLASS identifier ":" end_of_statement block_statements {
		$$ = {
			type: "expression_assignment",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			reference: {
			    type: "expression_reference",
				loc_sx: @2.first_column,
				loc_sy: @2.first_line,
				loc_ex: @2.last_column,
				loc_ey: @2.last_line,
			    subject: null,
				field: {
					type: "expression_value",
					loc_sx: @2.first_column,
					loc_sy: @2.first_line,
					loc_ex: @2.last_column,
					loc_ey: @2.last_line,
					value_type: "string",
					value: $2
				}
			},
			expression: {
				type: "expression_class",
				loc_sx: @4.first_column,
				loc_sy: @4.first_line,
				loc_ex: @4.last_column,
				loc_ey: @4.last_line,
				extension: null,
				operation: $5
			}
		};
	}
	| CLASS identifier "(" expression_reference ")" ":" end_of_statement block_statements {
		$$ = {
			type: "expression_assignment",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			reference: {
			    type: "expression_reference",
				loc_sx: @2.first_column,
				loc_sy: @2.first_line,
				loc_ex: @2.last_column,
				loc_ey: @2.last_line,
			    subject: null,
				field: {
					type: "expression_value",
					loc_sx: @2.first_column,
					loc_sy: @2.first_line,
					loc_ex: @2.last_column,
					loc_ey: @2.last_line,
					value_type: "string",
					value: $2
				}
			},
			expression: {
				type: "expression_class",
				loc_sx: @4.first_column,
				loc_sy: @4.first_line,
				loc_ex: @4.last_column,
				loc_ey: @4.last_line,
				extension: $4,
				operation: $8
			}
		};
	}
	;
statement_return
	: RETURN expression {
		$$ = {
			type: "statement_return",
			loc_sx: @$.first_column,
			loc_sy: @$.first_line,
			loc_ex: @$.last_column,
			loc_ey: @$.last_line,
			result: $2
		};
	}
	;
list_expression
	: { $$ = []; }
	| list_expression "," expression { $$ = $1.concat($3); }
	| expression { $$ = [$1]; }
	;
list_identifier
	: { $$ = []; }
	| list_identifier "," identifier { $$ = $1.concat($3); }
	| identifier { $$ = [$1]; }
	;
list_kvpair
	: { $$ = []; }
	| list_kvpair "," kvpair { $$ = $1.concat($3); }
	| kvpair { $$ = [$1]; }
	;
kvpair
	: expression ":" expression {
		$$ = {
			k: $1,
			v: $3
		}
	}
	;
block_statements
    : "<{" list_statement "}>" {
        $$ = {
            type: "statement_block",
            body: $2,
            loc_sx: @$.first_column,
            loc_sy: @$.first_line,
            loc_ex: @$.last_column,
            loc_ey: @$.last_line,
        };
    };
list_statement
	: list_statement statement { $$ = $1.concat([$2]); }
	| { $$ = []; }
	;