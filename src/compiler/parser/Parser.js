class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
    this.errors = [];
  }

  // ==========================================
  // TOKEN HELPERS
  // ==========================================

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

  addError(message, token = this.currentToken()) {
    this.errors.push({
      message,
      line: token?.line || 0,
      column: token?.column || 0,
    });
  }

  expect(type, value = null) {
    const token = this.currentToken();

    if (!token) {
      this.addError(
        `Expected ${value || type}, but reached end of input.`
      );

      return null;
    }

    if (token.type !== type) {
      this.addError(
        `Expected ${value || type}, found '${token.value}'.`,
        token
      );

      return null;
    }

    if (value !== null && token.value !== value) {
      this.addError(
        `Expected '${value}', found '${token.value}'.`,
        token
      );

      return null;
    }

    this.advance();

    return token;
  }

  // ==========================================
  // PROGRAM
  // ==========================================

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

  // ==========================================
  // STATEMENTS
  // ==========================================

  parseStatement() {
    const token = this.currentToken();

    if (!token) {
      return null;
    }

    // Variable declaration
    if (
      token.type === "KEYWORD" &&
      ["int", "float", "string", "boolean"].includes(
        token.value
      )
    ) {
      return this.parseVariableDeclaration();
    }

    this.addError(
      `Unexpected token '${token.value}'.`,
      token
    );

    return null;
  }

  // ==========================================
  // VARIABLE DECLARATION
  // ==========================================

  parseVariableDeclaration() {
    const typeToken = this.currentToken();

    this.advance();

    const identifierToken =
      this.expect("IDENTIFIER");

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

      line: typeToken.line,

      column: typeToken.column,
    };
  }

  // ==========================================
  // EXPRESSION
  // ==========================================

  parseExpression() {
    return this.parseLogicalOr();
  }

  // ==========================================
  // LOGICAL OR
  //
  // ||
  // Lowest precedence
  // ==========================================

  parseLogicalOr() {
    let left = this.parseLogicalAnd();

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      this.currentToken().value === "||"
    ) {
      const operatorToken = this.currentToken();

      this.advance();

      const right = this.parseLogicalAnd();

      if (!right) {
        return null;
      }

      left = {
        type: "LogicalExpression",

        operator: "||",

        left,

        right,

        line: operatorToken.line,

        column: operatorToken.column,
      };
    }

    return left;
  }

  // ==========================================
  // LOGICAL AND
  //
  // &&
  // ==========================================

  parseLogicalAnd() {
    let left = this.parseEquality();

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      this.currentToken().value === "&&"
    ) {
      const operatorToken = this.currentToken();

      this.advance();

      const right = this.parseEquality();

      if (!right) {
        return null;
      }

      left = {
        type: "LogicalExpression",

        operator: "&&",

        left,

        right,

        line: operatorToken.line,

        column: operatorToken.column,
      };
    }

    return left;
  }

  // ==========================================
  // EQUALITY
  //
  // == !=
  // ==========================================

  parseEquality() {
    let left = this.parseComparison();

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      ["==", "!="].includes(
        this.currentToken().value
      )
    ) {
      const operatorToken = this.currentToken();

      this.advance();

      const right = this.parseComparison();

      if (!right) {
        return null;
      }

      left = {
        type: "BinaryExpression",

        operator: operatorToken.value,

        left,

        right,

        line: operatorToken.line,

        column: operatorToken.column,
      };
    }

    return left;
  }

  // ==========================================
  // COMPARISON
  //
  // > < >= <=
  // ==========================================

  parseComparison() {
    let left = this.parseAdditionSubtraction();

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      [">", "<", ">=", "<="].includes(
        this.currentToken().value
      )
    ) {
      const operatorToken = this.currentToken();

      this.advance();

      const right = this.parseAdditionSubtraction();

      if (!right) {
        return null;
      }

      left = {
        type: "BinaryExpression",

        operator: operatorToken.value,

        left,

        right,

        line: operatorToken.line,

        column: operatorToken.column,
      };
    }

    return left;
  }

  // ==========================================
  // ADDITION / SUBTRACTION
  //
  // + -
  // ==========================================

  parseAdditionSubtraction() {
    let left = this.parseMultiplicationDivision();

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      ["+", "-"].includes(
        this.currentToken().value
      )
    ) {
      const operatorToken = this.currentToken();

      this.advance();

      const right =
        this.parseMultiplicationDivision();

      if (!right) {
        return null;
      }

      left = {
        type: "BinaryExpression",

        operator: operatorToken.value,

        left,

        right,

        line: operatorToken.line,

        column: operatorToken.column,
      };
    }

    return left;
  }

  // ==========================================
  // MULTIPLICATION / DIVISION
  //
  // * /
  // ==========================================

  parseMultiplicationDivision() {
    let left = this.parsePrimary();

    while (
      this.currentToken() &&
      this.currentToken().type === "OPERATOR" &&
      ["*", "/"].includes(
        this.currentToken().value
      )
    ) {
      const operatorToken = this.currentToken();

      this.advance();

      const right = this.parsePrimary();

      if (!right) {
        return null;
      }

      left = {
        type: "BinaryExpression",

        operator: operatorToken.value,

        left,

        right,

        line: operatorToken.line,

        column: operatorToken.column,
      };
    }

    return left;
  }

  // ==========================================
  // PRIMARY EXPRESSIONS
  // ==========================================

  parsePrimary() {
    const token = this.currentToken();

    if (!token) {
      this.addError(
        "Expected expression."
      );

      return null;
    }

    // INTEGER
    if (token.type === "INTEGER") {
      this.advance();

      return {
        type: "IntegerLiteral",

        value: Number(token.value),

        line: token.line,

        column: token.column,
      };
    }

    // FLOAT
    if (token.type === "FLOAT") {
      this.advance();

      return {
        type: "FloatLiteral",

        value: Number(token.value),

        line: token.line,

        column: token.column,
      };
    }

    // STRING
    if (token.type === "STRING") {
      this.advance();

      return {
        type: "StringLiteral",

        value: token.value,

        line: token.line,

        column: token.column,
      };
    }

    // BOOLEAN
    if (token.type === "BOOLEAN") {
      this.advance();

      return {
        type: "BooleanLiteral",

        value: token.value === "true",

        line: token.line,

        column: token.column,
      };
    }

    // IDENTIFIER
    if (token.type === "IDENTIFIER") {
      this.advance();

      return {
        type: "Identifier",

        name: token.value,

        line: token.line,

        column: token.column,
      };
    }

    // PARENTHESES
    if (
      token.type === "SYMBOL" &&
      token.value === "("
    ) {
      this.advance();

      const expression =
        this.parseExpression();

      this.expect("SYMBOL", ")");

      return {
        type: "ParenthesizedExpression",

        expression,

        line: token.line,

        column: token.column,
      };
    }

    this.addError(
      `Unexpected token '${token.value}' in expression.`,
      token
    );

    return null;
  }

  // ==========================================
  // ERROR RECOVERY
  // ==========================================

  synchronize() {
    while (
      this.position < this.tokens.length
    ) {
      const token =
        this.currentToken();

      if (token.value === ";") {
        this.advance();

        return;
      }

      this.advance();
    }
  }
}

export default Parser;