/*
 * PEGjs for a "Pl-0" like language
 * Used in ULL PL Grado de Informática classes
 */

{
  var tree = function(f, r) {
    if (r.length > 0) {
      var last = r.pop();
      var result = {
        type:  last[0],
        left: tree(f, r),
        right: last[1]
      };
    }
    else {
      var result = f;
    }
    return result;
  }
}

program = block

block = COMMENT* cD:constantDeclaration? COMMENT* vD:varDeclaration? COMMENT* fD:functionDeclaration* COMMENT* st:st* COMMENT*
          {
            let constants = cD? cD : [];
            let variables = vD? vD : [];
            return { 
              type: 'BLOCK', 
              constants: constants, 
              variables: variables, 
              functions: fD, 
              main: st
            };
          }

constantDeclaration = CONST id:ID ASSIGN n:NUMBER rest:(COMMA ID ASSIGN NUMBER)* SC 
                        {
                          let r = rest.map( ([_, id, __, nu]) => [id.value, nu.value] );
                          return [[id.value, n.value]].concat(r) 
                        }

varDeclaration = VAR id:ID rest:(COMMA ID)* SC
                    { 
                      let r = rest.map( ([_, id]) => id.value );
                      return [id.value].concat(r) 
                    }

functionDeclaration = FUNCTION id:ID LEFTPAR !COMMA tipo p1:ID? r:(COMMA tipo ID)* RIGHTPAR CL b:block CR
      {
        let params = p1? [p1] : [];
        params = params.concat(r.map(([_, p]) => p)); 
        return {
          type: 'FUNCTION',
          name: id,
          params: params,
          block: b,
        };

      }


st     = CL s1:st? r:(SC st)* SC* CR {
               //console.log(location()) /* atributos start y end */
               let t = [];
               if (s1) t.push(s1);
               return {
                 type: 'COMPOUND', // Chrome supports destructuring
                 children: t.concat(r.map( ([_, st]) => st ))
               };
            }
       / IF e:assign THEN st:st ELSE sf:st
           {
             return {
               type: 'IFELSE',
               c:  e,
               st: st,
               sf: sf,
             };
           }
       / IF e:assign THEN st:st    
           {
             return {
               type: 'IF',
               c:  e,
               st: st
             };
           }
       / WHILE a:assign DO st:st {
             return { type: 'WHILE', c: a, st: st };
           }
       / RETURN a:assign? {
             return { type: 'RETURN', children: a? [a] : [] };
           }
       / assign

assign = i:ID ASSIGN e:cond            
            { return {type: '=', left: i, right: e}; }
       / cond

cond = l:exp op:COMP r:exp { return { type: op, left: l, right: r} }
     / exp
     / string
     
string = QUOTE string:CADENA QUOTE SC { return { type: "STRING", value: string};}

exp    = t:term   r:(ADD term)*   { return tree(t,r); }
term   = f:factor r:(MUL factor)* { return tree(f,r); }

factor = NUMBER
       / f:ID LEFTPAR a:assign? r:(COMMA assign)* RIGHTPAR
         {
           let t = [];
           if (a) t.push(a);
           return { 
             type: 'CALL',
             func: f,
             arguments: t.concat(r.map(([_, exp]) => exp))
           }
         }
       / ID
       / LEFTPAR t:assign RIGHTPAR   { return t; }

tipo = INT / FLOAT / DOUBLE / CHAR / STRING / BOOLEAN

_ = $[ \t\n\r]*

COMMENT  = _ ["//""#"] $[ a-zA-Z0-9]* _  { return "COMENTARIO"; }

CADENA	 	= _ str:([a-zA-Z0-9_ ]*) _ { return str.join(""); }
QUOTE = _ '"' _ {return '"'; }

INT      = _"int"_		{ return "int" }
FLOAT	 = _"float"_	{ return "float" }
DOUBLE 	 = _"double"_	{ return "double" }
CHAR	 = _"char"_		{ return "char" }
STRING	 = _"string"_	{ return "string" }
BOOLEAN	 = _"boolean"_	{ return "boolean" }

ASSIGN   = _ op:'=' _  { return op; }
ADD      = _ op:[+-] _ { return op; }
MUL      = _ op:[*/] _ { return op; }
LEFTPAR  = _"("_
RIGHTPAR = _")"_
CL       = _"{"_
CR       = _"}"_
SC       = _";"+_
COMMA    = _","_
COMP     = _ op:("=="/"!="/"<="/">="/"<"/">") _ { 
               return op;
            }
IF       = _ "if" _
THEN     = _ "then" _
ELSE     = _ "else" _
WHILE    = _ "while" _
DO       = _ "do" _
RETURN   = _ "return" _
VAR      = _ "var" _
CONST    = _ "const" _
FUNCTION = _ "function" _
ID       = _ id:$([a-zA-Z_][a-zA-Z_0-9]*) _ 
            { 
              return { type: 'ID', value: id }; 
            }
NUMBER   = _ digits:$[0-9]+ _ 
            { 
              return { type: 'NUM', value: parseInt(digits, 10) }; 
            }