Python.runtime_error = function(error) {
    update_python_state(PYTHON_STATE.READY);

    if (error.type !== ERROR.RUNTIME.INTERRUPT) append_log("哦, 不! 发生了一个运行错误!\n");
    else append_log("手动打断程序运行!\n");
    // Print out callstack.
    if (!error.callstack) error.callstack = [];

    let i = error.callstack.length;
    while (i > 0) {
        i = i - 1;
        append_log("在第 " + error.callstack[i].node.loc_sy + " 行\n");
    }

    append_log("在第 " + error.node.loc_sy + " 行\n\n");
    code_area.focus();
    code_area.setSelection({
        line:   error.node.loc_ey - 1,
        ch:     error.node.loc_ex
    },{
        line:   error.node.loc_sy - 1,
        ch:     error.node.loc_sx
    });
    switch (error.type) {
        case ERROR.RUNTIME.TYPE: {
            append_log("类型错误\n");
            append_log("这里的类型可以是:\n    ");
            let i = 0;
            while (i < error.expected.length) {
                append_log(Python.type_to_string(error.expected[i]));
                if (i <= error.expected.length - 2) append_log(",");
                i = i + 1;
            }
            append_log("\n");
            append_log("但你给了一个:\n    ");
            append_log(Python.type_to_string(error.however));
            append_log("!\n");
            return;
        }
        case ERROR.RUNTIME.BINARY: {
            append_log("二元算式错误\n");
            append_log("这通常是因为你的运算符没法处理算式两边的变量类型。\n");
            append_log("算式符号: " + error.node.op + "\n");
            append_log("算式左边: " + Python.type_and_value_to_string(error.value_l) + "\n");
            append_log("算式右边: " + Python.type_and_value_to_string(error.value_r) + "\n");
            return;
        }
        case ERROR.RUNTIME.UNARY: {
            append_log("一元算式错误\n");
            append_log("这通常是因为你的运算符没法处理相应的变量类型。\n");
            append_log("算式符号: " + error.node.op + "\n");
            append_log("算式内部: " + Python.type_and_value_to_string(error.value) + "\n");
            return;
        }
        case ERROR.RUNTIME.INTERRUPT: {
            append_log("被打断\n");
            return;
        }
        case ERROR.RUNTIME.JAVASCRIPT: {
            append_log("浏览器内部错误\n");
            append_log("这表明浏览器内部的函数出了问题。请检查你的数学计算。\n如果没有问题, 说明这个错误不是你造成的, 请把你的代码发送给艺程公司。\n\n");
            append_log("内部错误信息:\n");
            append_log(error.error.toString() + "\n");
            return;
        }
        case ERROR.RUNTIME.REFERENCE: {
            append_log("引用错误\n");
            if (error.subject === null)
                append_log("找不到变量 " + Python.value_to_string(error.field) + "\n");
            else
                append_log("找不到" + Python.type_and_value_to_string(error.subject) + " 的 " + Python.type_and_value_to_string(error.field) + " 属性\n");
            return;
        }
        case ERROR.RUNTIME.NUM_ARG: {
            append_log("函数变量数量错误\n");
            append_log("这个函数需要 " + error.define.arguments.length.toString() + " 个变量,\n");
            append_log("但是你给了 " + error.node.arguments.length.toString() + " 个变量!\n");
            return;
        }
        case ERROR.RUNTIME.UNKNOWN_NODE: {
            append_log("语法树错误\n");
            append_log("这个错误通常不是你造成的。请把你的代码发送给艺程公司。\n");
            return;
        }
    }
};
Python.value_to_string = function(node) {
    switch (node.value_type) {
        case TYPE.NUMBER:
            return node.value.toString();
        case TYPE.BOOLEAN:
            return node.value ? "True" : "False";
        case TYPE.STRING:
            return node.value;
        case TYPE.ARRAY: {
            let s = "[";
            let i = 0;
            while (i < node.value.length) {
                s = s + Python.value_to_string(node.value[i]);
                i = i + 1;
                if (i < node.value.length) s = s + ",";
            }
            return s + "]";
        }
        case TYPE.OBJECT: {
            let s = "[";
            for (let i in node.value) {
                s = s + i.toString() + ":" + Python.value_to_string(node.value[i]) + ",";
            }
            if (s[s.length - 1] === ",") s = s.slice(0, -1);
            return s + "}";
        }
        default:
            return Python.type_to_string(node.value_type);
    }
};
Python.type_to_string = function(type) {
    switch (type) {
        case TYPE.BOOLEAN:      return "布尔";
        case TYPE.NUMBER:       return "数字";
        case TYPE.STRING:       return "字符串";
        case TYPE.FUNCTION:     return "函数";
        case TYPE.CLASS:        return "类";
        case TYPE.NULL:         return "空";
        case TYPE.ARRAY:        return "数组";
        case TYPE.OBJECT:       return "对象";
    }
    return "未知的类型";
};
Python.type_and_value_to_string = function(node) {
    switch (node.value_type) {
        case TYPE.NUMBER:
        case TYPE.BOOLEAN:
        case TYPE.STRING:
        case TYPE.ARRAY:
        case TYPE.OBJECT:
            return Python.type_to_string(node.value_type) + " " + Python.value_to_string(node);
        default:
            return Python.type_to_string(node.value_type);
    }
};
Python.token_to_text = function(text) {
    switch (text) {
        case "IF":
            return "if";
        case "ELSE":
            return "else";
        case "WHILE":
            return "while";
        case "FOR":
            return "for";
        case "IN":
            return "in";
        case "DEF":
            return "def";
        case "CLASS":
            return "class";
        case "RETURN":
            return "return";
        case "TRUE":
            return "True";
        case "FALSE":
            return "False";
        case "IDENTIFIER":
            return "变量或域名";
        case "STRING":
            return "字符串";
        case "NUMBER":
            return "数字";
        case "NEWLINE":
            return "换行符";
        case "EOF":
            return "文本结束";
        default:
            return text;
    }
};
Python.character_to_text = function(c) {
    switch (c) {
        case "\n":
            return "换行符";
        case " ":
            return "空格";
        case null:
        case "EOF":
            return "文本结束";
        default:
            return c;
    }
};
Python.parse_error = function(error) {
    update_python_state(PYTHON_STATE.READY);
    append_log("哦, 不! 发生了一个解释错误!\n\n");
    code_area.focus();
    code_area.setSelection({
        line:   error.loc.ey - 1,
        ch:     error.loc.ex
    },{
        line:   error.loc.sy - 1,
        ch:     error.loc.sx
    });
    switch (error.type) {
        case ERROR.YACC: {
            if (error.however === "<{") {
                append_log("缩进错误\n");
                append_log("你缩进的太多了!\n");
                return;
            }
            if (error.however === "}>") {
                append_log("缩进错误\n");
                append_log("你缩进的太少了!\n");
                return;
            }
            append_log("语法解析错误\n");
            append_log("这里的部分可以是:\n    ");
            let i = 0;
            while (i < error.expected.length) {
                append_log(Python.token_to_text(error.expected[i].slice(1, -1)));
                if (i <= error.expected.length - 2) append_log(" ");
                i = i + 1;
            }
            append_log("\n");
            append_log("但你给了一个:\n    ");
            append_log(Python.token_to_text(error.however));
            append_log("\n");
            return;
        }
        case ERROR.LEX.EXPECT: {
            append_log("词语解析错误\n");
            append_log("这里的部分可以是:\n    ");
            let i = 0;
            while (i < error.expected.length) {
                append_log(Python.character_to_text(error.expected[i]));
                if (i <= error.expected.length - 2) append_log(" ");
                i = i + 1;
            }
            append_log("\n");
            append_log("但你给了一个:\n    ");
            append_log(Python.character_to_text(error.however));
            append_log("\n");
            return;
        }
        case ERROR.LEX.INDENT: {
            append_log("缩进错误\n");
            append_log("你的缩进了 " + error.however.toString() + " 不是4的倍数!\n");
            return;
        }
        case ERROR.LEX.STATE: {
            append_log("词语状态错误\n");
            append_log("这个错误通常不是你造成的。请把你的代码发送给艺程公司。\n");
            return;
        }
    }
    throw error;
};