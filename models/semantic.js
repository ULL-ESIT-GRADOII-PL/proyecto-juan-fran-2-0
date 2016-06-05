(() => {
        var semanticErrors = "";
        var semantic = (tree) => {
            var emptySymbolTable = {};
            eachBlockPre(tree, makeTable, emptySymbolTable);
            eachBlockPre(tree, findCalls);
            if (semanticErrors.length > 0) {
                tree.errors = "Semantic Errors:&#13;&#10;" + semanticErrors.substring(0, semanticErrors.length - 10);
                semanticErrors = "";
            }
        };

        var eachBlockPre = (tree, action, f) => {
            action(tree, f);
            tree.functions.forEach((func) => eachBlockPre(func, action, tree.symbolTable));
        };

        var makeTable = (block, fatherTable) => {
            block.symbolTable = {
                father: fatherTable
            };
            block.variables.forEach((variable) => add(variable, block.symbolTable));
            block.constants.forEach((constant) => add(constant, block.symbolTable));
            block.functions.forEach((func) => add(func, block.symbolTable));
        };

        var add = (sym, table) => {
            if (checkDecl(sym.name, table, (sym.getSymbol() != "Variable"))) {
                if (parseInt(sym.location.end.line) - parseInt(sym.location.start.line) == 1 || parseInt(sym.location.end.line) - parseInt(sym.location.start.line) == 0) {
                    semanticErrors += "'" + sym + "' has already been declared in line " + sym.location.start.line + "&#13;&#10;";
                }
                else {
                    semanticErrors += "'" + sym + "' has already been declared between lines " +
                        sym.location.start.line + " and " + (parseInt(sym.location.end.line) - 1) + "&#13;&#10;";
                }
            }
            table[sym.name] = sym.getSymbol();
        };

        var checkDecl = (nameSym, table, checkFathers) => {
            var auxTable = table;
            do {
                if (auxTable[nameSym])
                    return auxTable[nameSym];
                auxTable = auxTable.father;
            } while (auxTable && checkFathers);
            return undefined;
        }

        var findCalls = (block) => {
            block.main.children.forEach((children) => {
                exploreChildren(children, block.symbolTable);
            });
        }

        var exploreChildren = (child, symbolTable) => {
            if (child.type == "CALL")
                checkCall(child, symbolTable);
            else if(child.type == "ID")
                checkId(child, symbolTable);
            for (var key in child) {
                if (child.hasOwnProperty(key)) {
                    if (child[key] instanceof Array)
                        child[key].forEach((c) => exploreChildren(c, symbolTable));
                    else if (child[key] instanceof Object)
                        exploreChildren(child[key], symbolTable);
                }
            }
        }

        var checkCall = (child, symbolTable) => {
            var symbol = checkDecl(child.func.value, symbolTable, true);
            if (symbol && parseInt(symbol.paramNum) != child.arguments.length)
                semanticErrors += "'" + child.func.value + "' has " + child.arguments.length + " parameters instead of " + symbol.paramNum + " in line " + child.location.start.line + "&#13;&#10;";
        }
    
        var checkId = (child, symbolTable) => {
            var symbol = checkDecl(child.value, symbolTable, true);
            if (!symbol)
                semanticErrors += "'" + child.value + "' has not been declared in line " + child.location.start.line + "&#13;&#10;";
        }

    module.exports = semantic;
})();
