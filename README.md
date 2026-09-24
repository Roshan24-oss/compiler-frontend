Compiler Frontend

A compiler frontend that transforms source code into an intermediate representation through lexical analysis, parsing, and semantic analysis.

Features

Lexer — Converts source code into tokens.

Parser — Builds an Abstract Syntax Tree (AST).

Semantic Analyzer — Checks types, scopes, and semantic rules.

AST / IR — Provides structured representations for later compiler stages.

Project Structure
src/
├── lexer/
├── parser/
├── ast/
├── semantic/
└── main.*

Getting Started

Clone the repository, install the required dependencies, and run the compiler frontend using the project's build command.

git clone <repository-url>
cd <repository-name>

Status

🚧 Work in progress — backend/code generation is not included yet.

