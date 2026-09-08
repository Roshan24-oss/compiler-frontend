import { useState } from "react";
import Lexer from "./compiler/lexer/Lexer";
import Parser from "./compiler/parser/Parser";
import ASTViewer from "./components/ASTVier";
import SemanticAnalyzer from "./compiler/semantic/SemanticAnalyzer.js";
import SymbolTable from "./compiler/SymbolTable.jsx";
function App() {
  const [code, setCode] = useState(
`int age = 20;
float salary = 25000.50;
string name = "Roshan";`
  );

  const [tokens, setTokens] = useState([]);
  const [errors, setErrors] = useState([]);
const [ast, setAst] = useState(null);
const [symbolTable, setSymbolTable] = useState({});

 
const compileCode = () => {

  // ==========================================
  // STEP 1: LEXICAL ANALYSIS
  // ==========================================

  const lexer = new Lexer(code);

  const lexerResult = lexer.tokenize();

  setTokens(lexerResult.tokens);
  setErrors(lexerResult.errors);

  // Clear previous results
  setAst(null);
  setSymbolTable({});


  // ==========================================
  // STEP 2: SYNTAX ANALYSIS
  // ==========================================

  if (lexerResult.errors.length === 0) {

    const parser =
      new Parser(lexerResult.tokens);

    const parsedAST =
      parser.parse();

    setAst(parsedAST);

    // If parser has errors
    if (parser.errors.length > 0) {

      setErrors(parser.errors);

      return;
    }


    // ==========================================
    // STEP 3: SEMANTIC ANALYSIS
    // ==========================================

    const semanticAnalyzer =
      new SemanticAnalyzer(parsedAST);

    const semanticResult =
      semanticAnalyzer.analyze();

    console.log(
      "Symbol Table:",
      semanticResult.symbolTable
    );

    console.log(
      "Semantic Errors:",
      semanticResult.errors
    );

    setSymbolTable(
      semanticResult.symbolTable
    );

    setErrors(
      semanticResult.errors
    );
  }
};

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <h1 className="text-3xl font-bold mb-6">
        JavaScript Compiler Frontend
      </h1>

      <div className="grid grid-cols-2 gap-6">

        {/* SOURCE CODE */}
        <div>

          <h2 className="text-xl font-semibold mb-2">
            Source Code
          </h2>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono"
          />

          <button
            onClick={compileCode}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Compile
          </button>

        </div>


        {/* TOKENS */}
        <div>

          <h2 className="text-xl font-semibold mb-2">
            Tokens
          </h2>

          <div className="bg-gray-900 rounded-lg overflow-hidden">

            <table className="w-full text-left">

              <thead className="bg-gray-800">

                <tr>
                  <th className="p-3">Lexeme</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Line</th>
                  <th className="p-3">Column</th>
                </tr>

              </thead>

              <tbody>

                {tokens.map((token, index) => (

                  <tr
                    key={index}
                    className="border-t border-gray-800"
                  >

                    <td className="p-3 font-mono">
                      {token.value}
                    </td>

                    <td className="p-3">
                      {token.type}
                    </td>

                    <td className="p-3">
                      {token.line}
                    </td>

                    <td className="p-3">
                      {token.column}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
{/* AST */}

<div className="mt-6">

  <ASTViewer ast={ast} />

<div className="mt-6 bg-gray-900 rounded-lg p-5">

  <SymbolTable
    symbolTable={symbolTable}
  />

</div>

</div>

          {/* ERRORS */}

          {errors.length > 0 && (

            <div className="mt-6 bg-red-950 border border-red-700 rounded-lg p-4">

              <h3 className="font-bold mb-2">
                Compiler Errors
              </h3>

              {errors.map((error, index) => (

                <p key={index}>
                  Line {error.line}, Column {error.column}:{" "}
                  {error.message}
                </p>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default App;