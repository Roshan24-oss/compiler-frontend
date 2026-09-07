class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.errors = [];
  }

  currentToken() {
    return this.tokens[this.position];
  }

  peekToken() {
    return this.tokens[this.position + 1];
  }

  advance() {
    if (this.position < this.tokens.length) {
      this.position++;
    }
  }

  addError(message) {
    const token = this.currentToken();

    this.errors.push({
      message,
      line: token?.line || 0,
      column: token?.column || 0,
    });
  }

  expect(type, value = null) {
    const token = this.currentToken();

    if (!token) {
      this.addError(`Expected ${value || type}, but reached end of input.`);
      return null;
    }

    if (token.type !== type) {
      this.addError(
        `Expected ${value || type}, found '${token.value}'.`
      );
      return null;
    }

    if (value !== null && token.value !== value) {
      this.addError(
        `Expected '${value}', found '${token.value}'.`
      );
      return null;
    }

    this.advance();

    return token;
  }

  parse() {
    const body = [];

    while (this.position < this.tokens.length) {
      const statement = this.parseStatement();

      if (statement) {
        body.push(statement);
      } else {
        this.synchronize();
      }
    }

    return {
      type: "Program",
      body,
    };
  }

  parseStatement() {
    const token = this.currentToken();

    if (!token) {
      return null;
    }

    if (
      token.type === "KEYWORD" &&
      ["int", "float", "string", "boolean"].includes(token.value)
    ) {
      return this.parseVariableDeclaration();
    }

    this.addError(
      `Unexpected token '${token.value}'.`
    );

    return null;
  }

  parseVariableDeclaration() {
    const typeToken = this.currentToken();

    this.advance();

    const identifierToken = this.expect("IDENTIFIER");

    if (!identifierToken) {
      return null;
    }

    this.expect("OPERATOR", "=");

    const value = this.parseExpression();

    if (!value) {
      return null;
    }

    this.expect("SYMBOL", ";");

    return {
      type: "VariableDeclaration",

      dataType: typeToken.value,

      identifier: identifierToken.value,

      value,
    };
  }

  parseExpression() {
    let left = this.parsePrimary();

    if (!left) {
      return null;
    }

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      ["+", "-", "*", "/"].includes(
        this.currentToken().value
      )
    ) {
      const operator = this.currentToken().value;

      this.advance();

      const right = this.parsePrimary();

      if (!right) {
        return null;
      }

      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  parsePrimary() {
    const token = this.currentToken();

    if (!token) {
      this.addError("Expected expression.");
      return null;
    }

    if (token.type === "INTEGER") {
      this.advance();

      return {
        type: "IntegerLiteral",
        value: Number(token.value),
      };
    }

    if (token.type === "FLOAT") {
      this.advance();

      return {
        type: "FloatLiteral",
        value: Number(token.value),
      };
    }

    if (token.type === "STRING") {
      this.advance();

      return {
        type: "StringLiteral",
        value: token.value,
      };
    }

    if (token.type === "BOOLEAN") {
      this.advance();

      return {
        type: "BooleanLiteral",
        value: token.value === "true",
      };
    }

    if (token.type === "IDENTIFIER") {
      this.advance();

      return {
        type: "Identifier",
        name: token.value,
      };
    }

    this.addError(
      `Unexpected token '${token.value}' in expression.`
    );

    return null;
  }

  synchronize() {
    while (this.position < this.tokens.length) {
      const token = this.currentToken();

      if (token.value === ";") {
        this.advance();
        return;
      }

      this.advance();
    }
  }
}

export default Parser;