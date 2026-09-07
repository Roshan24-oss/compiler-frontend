const KEYWORDS = [
  "int",
  "float",
  "string",
  "boolean",
  "if",
  "else",
  "while",
  "return",
];

const OPERATORS = [
  "+",
  "-",
  "*",
  "/",
  "=",
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
  "&&",
  "||",
];

const SYMBOLS = [
  "(",
  ")",
  "{",
  "}",
  "[",
  "]",
  ";",
  ",",
];

class Lexer {
  constructor(sourceCode) {
    this.sourceCode = sourceCode;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
  }

  currentChar() {
    return this.sourceCode[this.position];
  }

  peekChar() {
    return this.sourceCode[this.position + 1];
  }

  advance() {
    if (this.currentChar() === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    this.position++;
  }

  addToken(type, value, line, column) {
    this.tokens.push({
      type,
      value,
      line,
      column,
    });
  }

  addError(message, line, column) {
    this.errors.push({
      message,
      line,
      column,
    });
  }

  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;

    let value = "";
    let hasDecimal = false;

    while (this.position < this.sourceCode.length) {
      const char = this.currentChar();

      if (/[0-9]/.test(char)) {
        value += char;
        this.advance();
      } else if (char === "." && !hasDecimal) {
        hasDecimal = true;
        value += char;
        this.advance();
      } else {
        break;
      }
    }

    this.addToken(
      hasDecimal ? "FLOAT" : "INTEGER",
      value,
      startLine,
      startColumn
    );
  }

  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;

    let value = "";

    while (this.position < this.sourceCode.length) {
      const char = this.currentChar();

      if (/[a-zA-Z0-9_]/.test(char)) {
        value += char;
        this.advance();
      } else {
        break;
      }
    }

    if (KEYWORDS.includes(value)) {
      this.addToken("KEYWORD", value, startLine, startColumn);
    } else if (value === "true" || value === "false") {
      this.addToken("BOOLEAN", value, startLine, startColumn);
    } else {
      this.addToken("IDENTIFIER", value, startLine, startColumn);
    }
  }

  readString() {
    const startLine = this.line;
    const startColumn = this.column;

    this.advance();

    let value = "";

    while (
      this.position < this.sourceCode.length &&
      this.currentChar() !== '"'
    ) {
      value += this.currentChar();
      this.advance();
    }

    if (this.currentChar() === '"') {
      this.advance();

      this.addToken(
        "STRING",
        value,
        startLine,
        startColumn
      );
    } else {
      this.addError(
        "Unterminated string",
        startLine,
        startColumn
      );
    }
  }

  readOperator() {
    const startLine = this.line;
    const startColumn = this.column;

    const twoCharOperator =
      this.currentChar() + this.peekChar();

    if (OPERATORS.includes(twoCharOperator)) {
      this.addToken(
        "OPERATOR",
        twoCharOperator,
        startLine,
        startColumn
      );

      this.advance();
      this.advance();

      return;
    }

    const oneCharOperator = this.currentChar();

    if (OPERATORS.includes(oneCharOperator)) {
      this.addToken(
        "OPERATOR",
        oneCharOperator,
        startLine,
        startColumn
      );

      this.advance();
    }
  }

  tokenize() {
    while (this.position < this.sourceCode.length) {
      const char = this.currentChar();

      // Ignore whitespace
      if (/\s/.test(char)) {
        this.advance();
        continue;
      }

      // Identifier / Keyword
      if (/[a-zA-Z_]/.test(char)) {
        this.readIdentifier();
        continue;
      }

      // Number
      if (/[0-9]/.test(char)) {
        this.readNumber();
        continue;
      }

      // String
      if (char === '"') {
        this.readString();
        continue;
      }

      // Operator
      if (
        OPERATORS.includes(char) ||
        OPERATORS.includes(char + this.peekChar())
      ) {
        this.readOperator();
        continue;
      }

      // Symbol
      if (SYMBOLS.includes(char)) {
        this.addToken(
          "SYMBOL",
          char,
          this.line,
          this.column
        );

        this.advance();
        continue;
      }

      // Unknown character
      this.addError(
        `Unknown character '${char}'`,
        this.line,
        this.column
      );

      this.advance();
    }

    return {
      tokens: this.tokens,
      errors: this.errors,
    };
  }
}

export default Lexer;