/***********************************************************

    Written by Tinynight: zblcm@163.com zblcm3@gmail.com
	
	Python.fixast accepts python text to parse, break it into lines, then parse them line by line using Python.raw.parse.
	After that, build the block structure and control flow by indentation.
	
	Python.fixloc travel through a fixed AST, and fix the line number recursively.

***********************************************************/

let Traveler = {};

Traveler.scope = function(parent) {
    let scope = {};

    scope.reference = {};
    scope.parent = parent;

    scope.set = function(k, v) {
        scope.reference[k] = v;
    };
    scope.get = function(k) {
        if (scope.reference[k] !== undefined) return scope.reference[k];
        if (scope.parent) return scope.parent.get(k);
    };

    return scope;
};

Traveler.process = function(node, resolve) {
    let root_scope = Traveler.scope(null);
    /*
        TODO:: fill in some preset functions to root_scope (range, len, print ...);
        TODO:: build default libraries (Turtle, pygame)
    */
	
	// print
    root_scope.set("print", Traveler.value_node(TYPE.FUNCTION, function(call_node, argument_list, resolve) {
        let st = "";
        let i = 0;
        while (i < argument_list.length) {
            st = st + Python.value_to_string(argument_list[i]);
            i = i + 1;
            if (i < argument_list.length)
                st = st + " ";
        }
        append_log(st, true);
        resolve(Traveler.value_node(TYPE.NULL, null, call_node));
    }, null));
	
	// len
    root_scope.set("len", Traveler.value_node(TYPE.FUNCTION, function(call_node, argument_list, resolve) {
		Traveler.assert_type(argument_list[0], [TYPE.STRING, TYPE.ARRAY]);
        resolve(Traveler.value_node(TYPE.NUMBER, argument_list[0].value.length, call_node));
    }, null));
	
	// range
    root_scope.set("range", Traveler.value_node(TYPE.FUNCTION, function(call_node, argument_list, resolve) {
        // Now only support range(a), not range(a, b)
		Traveler.assert_type(argument_list[0], [TYPE.NUMBER]);
        let result = [];
        for (let i = 0; i < argument_list[0].value; i++)
            result.push(Traveler.value_node(TYPE.NUMBER, i, call_node));
        resolve(Traveler.value_node(TYPE.ARRAY, result, call_node));
    }, null));
	// console.log(node);

	let reject = Python.runtime_error;
	Traveler.rejecter = reject;
	Traveler.rejected = false;
    Traveler.process_node(node, root_scope, resolve, reject);
};

Traveler.wait_node = function(node, scope, resolve, reject) {
	if (Traveler.rejected)
		reject({
			type:		ERROR.RUNTIME.INTERRUPT,
			node:		node
		});
	else
		Traveler.wait(function() {
			Traveler.process_node(node, scope, resolve, reject);
		});
};
Traveler.wait = function(resolve) {
    setTimeout(function() {
        resolve();
    }, 0);
};
Traveler.value_node = function(value_type, value, origin) {
	return {
		type: NODE.EXPRESSION.VALUE,
		value_type: value_type,
		value: value,
		origin: origin
	}
};
Traveler.handle_calc = function(node, t0, t1) {
	switch (t0.value_type) {
		case TYPE.NUMBER:
			if (t1.value_type == TYPE.NUMBER)
				switch (node.op) {
					case "*":
						return Traveler.value_node(TYPE.NUMBER,  t0.value * t1.value,  node);
					case "/":
						return Traveler.value_node(TYPE.NUMBER,  t0.value / t1.value,  node);
					case "%":
						return Traveler.value_node(TYPE.NUMBER,  t0.value % t1.value,  node);
					case "+":
						return Traveler.value_node(TYPE.NUMBER,  t0.value + t1.value,  node);
					case "-":
						return Traveler.value_node(TYPE.NUMBER,  t0.value - t1.value,  node);
					case "<<":
						return Traveler.value_node(TYPE.NUMBER,  t0.value << t1.value, node);
					case ">>":
						return Traveler.value_node(TYPE.NUMBER,  t0.value >> t1.value, node);
					case "<":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value < t1.value,  node);
					case ">":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value > t1.value,  node);
					case "<=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value <= t1.value, node);
					case ">=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value >= t1.value, node);
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
					case "&":
						return Traveler.value_node(TYPE.NUMBER,  t0.value & t1.value,  node);
					case "^":
						return Traveler.value_node(TYPE.NUMBER,  t0.value ^ t1.value,  node);
					case "|":
						return Traveler.value_node(TYPE.NUMBER,  t0.value | t1.value,  node);
				}
			break;
		case TYPE.BOOLEAN:
			if (t1.value_type == TYPE.BOOLEAN)
				switch (node.op) {
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
					case "&&":
						return Traveler.value_node(TYPE.NUMBER,  t0.value && t1.value, node);
					case "||":
						return Traveler.value_node(TYPE.NUMBER,  t0.value || t1.value, node);
				}
			break;
		case TYPE.STRING:
			if (t1.value_type == TYPE.STRING)
				switch (node.op) {
					case "+":
						return Traveler.value_node(TYPE.STRING,  t0.value + t1.value,  node);
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
				}
			break;
		case TYPE.ARRAY:
			if (t1.value_type == TYPE.ARRAY)
				switch (node.op) {
					case "+":
						return Traveler.value_node(TYPE.ARRAY, t0.value.concat(t1.value));
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
				}
			break;
		case TYPE.FUNCTION:
			if (t1.value_type == TYPE.FUNCTION)
				switch (node.op) {
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
				}
			break;
		case TYPE.CLASS:
			if (t1.value_type == TYPE.CLASS)
				switch (node.op) {
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
				}
			break;
		case TYPE.OBJECT:
			if (t1.value_type == TYPE.OBJECT)
				switch (node.op) {
					case "==":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value == t1.value, node);
					case "!=":
						return Traveler.value_node(TYPE.BOOLEAN, t0.value != t1.value, node);
				}
			break;
	}
	throw {
		type:		ERROR.RUNTIME.BINARY,
		node:		node,
		value_l:	t0,
		value_r:	t1
	};
};
Traveler.assert_type = function(node, types) {
	for (let i in types)
		if (node.value_type == types[i])
			return;
	throw {
		type:		ERROR.RUNTIME.TYPE,
		node:		node,
		expected:	types,
		however:	node.value_type
	}
};

Traveler.process_node = function(node, scope, resolve, reject) {
    // console.log(node);
	// TODO:: catch error, tag location info if missing, then throw again.
	try {
		switch (node.type) {
			case NODE.EXPRESSION.ASSIGNMENT: {
				Traveler.process_node(node.expression, scope, function (value_result) {
					if (node.reference.subject === null)
						Traveler.process_node(node.reference.field, scope, function (field_result) {
							Traveler.assert_type(field_result, [TYPE.STRING]);
							scope.set(field_result.value, value_result);
							resolve(value_result);
						}, reject);
					else
						Traveler.process_node(node.reference.subject, scope, function (subject_result) {
							if (subject_result.value_type == TYPE.ARRAY)
								Traveler.process_node(node.reference.field, scope, function (field_result) {
									Traveler.assert_type(field_result, [TYPE.NUMBER]);
									(subject_result.value)[field_result.value] = value_result;
									resolve(value_result);
								}, reject);
							if (subject_result.value_type == TYPE.OBJECT)
								Traveler.process_node(node.reference.field, scope, function (field_result) {
									Traveler.assert_type(field_result, [TYPE.NUMBER, TYPE.STRING]);
									(subject_result.value)[field_result.value] = value_result;
									resolve(value_result);
								}, reject);
						}, reject);
				}, reject);
				break;
			}
			case NODE.EXPRESSION.TERNARY: {
				Traveler.process_node(node.t0, scope, function (t0_result) {
					Traveler.assert_type(t0_result, [TYPE.BOOLEAN]);
					if (t0_result.value) Traveler.process_node(node.t1, scope, function (t1_result) {
						resolve(t1_result);
					}, reject);
					else Traveler.process_node(node.t2, scope, function (t2_result) {
						resolve(t2_result);
					}, reject);
				}, reject);
				break;
			}
			case NODE.EXPRESSION.BINARY: {
				Traveler.process_node(node.t0, scope, function (t0_result) {
					if ((node.op === "&&") && (t0_result.value_type == TYPE.BOOLEAN) && (!t0_result.value)) {
						resolve(Traveler.value_node(TYPE.BOOLEAN, false, node));
						return;
					}
					if ((node.op === "||") && (t0_result.value_type == TYPE.BOOLEAN) && (t0_result.value)) {
						resolve(Traveler.value_node(TYPE.BOOLEAN, true, node));
						return;
					}
					Traveler.process_node(node.t1, scope, function (t1_result) {
						resolve(Traveler.handle_calc(node, t0_result, t1_result));
					}, reject);
				}, reject);
				break;
			}
			case NODE.EXPRESSION.UANRY: {
				Traveler.process_node(node.t0, scope, function (t0_result) {
					switch (node.op) {
						case "~":
							Traveler.assert_type(t0_result, [TYPE.NUMBER]);
							resolve(Traveler.value_node(TYPE.NUMBER, ~t0_result.value, node));
							break;
						case "!":
						case "not":
							Traveler.assert_type(t0_result, [TYPE.BOOLEAN]);
							resolve(Traveler.value_node(TYPE.BOOLEAN, !t0_result.value, node));
							break;
						default:
							throw {
								type: ERROR.RUNTIME.UNARY,
								node: node,
								value: t0_result
							};
					}
				}, reject);
				break;
			}
			case NODE.EXPRESSION.REFERENCE: {
				if (node.subject === null)
					Traveler.process_node(node.field, scope, function (field_result) {
						Traveler.assert_type(field_result, [TYPE.STRING]);
						let result = scope.get(field_result.value);
						if (result === undefined)
							throw {
								type: ERROR.RUNTIME.REFERENCE,
								node: node,
								subject: null,
								field: field_result,
							};
						resolve(result);
					}, reject);
				else
					Traveler.process_node(node.subject, scope, function (subject_result) {
						Traveler.assert_type(subject_result, [TYPE.ARRAY, TYPE.OBJECT]);
						if (subject_result.value_type == TYPE.ARRAY)
							Traveler.process_node(node.field, scope, function (field_result) {
								Traveler.assert_type(field_result, [TYPE.NUMBER]);
								let result = (subject_result.value)[field_result.value];
								if (result === undefined)
									throw {
										type: ERROR.RUNTIME.REFERENCE,
										node: node,
										subject: subject_result,
										field: field_result,
									};
								resolve(result);
							}, reject);
						if (subject_result.value_type == TYPE.OBJECT)
							Traveler.process_node(node.field, scope, function (field_result) {
								Traveler.assert_type(field_result, [TYPE.NUMBER, TYPE.STRING]);
								let result = (subject_result.value)[field_result.value];
								if (result === undefined)
									throw {
										type: ERROR.RUNTIME.REFERENCE,
										node: node,
										subject: subject_result,
										field: field_result,
									};
								resolve(result);
							}, reject);
					}, reject);
				break;
			}
			case NODE.EXPRESSION.VALUE: {
				resolve(node);
				break;
			}
			case NODE.EXPRESSION.CALL: {
				Traveler.process_node(node.subject, scope, function (subject_result) {
					let argument_list = [];
					let process_next = function (i) {
						if (i < node.arguments.length) Traveler.process_node(node.arguments[i], scope, function (argument_result) {
							argument_list.push(argument_result);
							process_next(i + 1);
						}, reject);
						else {
							Traveler.assert_type(subject_result, [TYPE.FUNCTION]);
							subject_result.value(node, argument_list, resolve, reject);
						}
					};
					process_next(0);
				}, reject);
				break;
			}
			case NODE.EXPRESSION.FUNCTION: {
				resolve(Traveler.value_node(TYPE.FUNCTION, function (call_node, argument_list, f_resolve, f_reject) {
					// create function scope.
					let f_scope = Traveler.scope(scope);

					// assign variables.
					if (node.arguments.length != argument_list.length)
						throw {
							type: ERROR.RUNTIME.NUM_ARG,
							define: node,
							node: call_node,
						};
					for (let i in node.arguments) {
						f_scope.set(node.arguments[i], argument_list[i]);
					}

					// set return state.
					f_scope.resolve = f_resolve;

					let g_reject = function (error) {
						if (error.callstack === undefined) error.callstack = [];
						error.callstack.push({
							define: node,
							node: call_node,
						});
						f_reject(error);
					};
					Traveler.rejecter = g_reject;

					// run the block.
					// TODO:: put error handle into stack.
					Traveler.wait_node(node.operation, f_scope, f_resolve, g_reject);
				}, node));
				break;
			}
			case NODE.EXPRESSION.CLASS: {
				// TODO:: add class support.
				resolve(Traveler.value_node(TYPE.NULL, null, node));
				break;
			}
			case NODE.EXPRESSION.ARRAY: {
				let array_result = [];
				let process_next = function (index) {
					if (index < node.expressions.length) Traveler.process_node(node.expressions[index], scope, function (expression_result) {
						array_result.push(expression_result);
						process_next(index + 1);
					}, reject);
					else resolve(Traveler.value_node(TYPE.ARRAY, array_result, node));
				};
				process_next(0);
				break;
			}
			case NODE.EXPRESSION.OBJECT: {
				let object_result = {};
				let process_next = function (index) {
					if (index < node.kvpairs.length) Traveler.process_node(node.kvpairs[index].v, scope, function (v_result) {
						Traveler.process_node(node.kvpairs[index].k, scope, function (k_result) {
							Traveler.assert_type(k_result, [TYPE.NUMBER, TYPE.STRING]);
							object_result[k_result.value] = v_result;
							process_next(index + 1);
						}, reject);
					}, reject);
					else resolve(Traveler.value_node(TYPE.OBJECT, object_result, node));
				};
				process_next(0);
				break;
			}

			// Statements. Statements always resolves null.
			case NODE.STATEMENT.EXPRESSION: {
				Traveler.process_node(node.expression, scope, function (result) {
					resolve(Traveler.value_node(TYPE.NULL, null, node));
				}, reject);
				break;
			}
			case NODE.STATEMENT.IF: {
				Traveler.process_node(node.condition, scope, function (test_result) {
					Traveler.assert_type(test_result, [TYPE.BOOLEAN]);
					if (test_result.value) Traveler.process_node(node.operation_then, scope, function (then_result) {
						resolve(Traveler.value_node(TYPE.NULL, null, then_result));
					}, reject);
					else if (node.operation_else)
						Traveler.process_node(node.operation_else, scope, function (else_result) {
							resolve(Traveler.value_node(TYPE.NULL, null, else_result));
						}, reject);
					else
						resolve(Traveler.value_node(TYPE.NULL, null, node));
				}, reject);
				break;
			}
			case NODE.STATEMENT.WHILE: {
				let process_next = function () {
					Traveler.process_node(node.condition, scope, function (condition_result) {
						Traveler.assert_type(condition_result, [TYPE.BOOLEAN]);
						if (condition_result.value) Traveler.wait_node(node.operation, scope, function (operation_result) {
							process_next();
						}, reject);
						else resolve(Traveler.value_node(TYPE.NULL, null, node));
					}, reject);
				};
				process_next();
				break;
			}
			case NODE.STATEMENT.FOR: {
				Traveler.process_node(node.container, scope, function (container_result) {
					// TODO:: add object support.
					Traveler.assert_type(container_result, [TYPE.ARRAY]);
					let index = 0;
					let process_next = function () {
						let assignment_node = {
							type: NODE.EXPRESSION.ASSIGNMENT,
							reference: node.variable,
							expression: {
								type: NODE.EXPRESSION.REFERENCE,
								subject: container_result,
								field: Traveler.value_node(TYPE.NUMBER, index, node)
							}
						};
						Traveler.process_node(assignment_node, scope, function (assignment_result) {
							Traveler.wait_node(node.operation, scope, function (operation_result) {
								index = index + 1;
								if (index < container_result.value.length) process_next();
								else resolve(Traveler.value_node(TYPE.NULL, null, operation_result));
							}, reject);
						}, reject);
					};
					process_next();
				}, reject);
				break;
			}
			case NODE.STATEMENT.RETURN: {
				Traveler.process_node(node.result, scope, function (result) {
					// Jump through several statements. Some statements will never get resolved. resolve() will never get called.
					scope.resolve(result);
				}, reject);
				break;
			}
			case NODE.STATEMENT.BLOCK: {
				let process_next = function (i) {
					if (i < node.body.length) Traveler.process_node(node.body[i], scope, function (statement_result) {
						process_next(i + 1);
					}, reject);
					else resolve(Traveler.value_node(TYPE.NULL, null, node));
				};
				process_next(0);
				break;
			}
			default:
				throw {
					type: ERROR.RUNTIME.UNKNOWN_NODE,
					node: node
				};
		}
    }
	catch (error) {
		if ((error.type) && (Object.values(ERROR.RUNTIME).indexOf(error.type) >= 0)) {
			let current_node = error.node;
			while ((current_node.loc_sx === undefined) && (current_node.origin))
				current_node = current_node.origin;
			error.node.loc_sx = current_node.loc_sx;
			error.node.loc_ex = current_node.loc_ex;
			error.node.loc_sy = current_node.loc_sy;
			error.node.loc_ey = current_node.loc_ey;
			reject(error);
		}
		else {
			reject({
				type:	ERROR.RUNTIME.JAVASCRIPT,
				node:	node,
				error:	error
			});
		}
	}
};