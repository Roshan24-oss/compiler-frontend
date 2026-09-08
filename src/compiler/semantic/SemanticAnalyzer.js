class SemanticAnalyzer {
  constructor(ast) {
    this.ast = ast;
    this.symbolTable = {};
    this.errors = [];
  }

  addError(message, line = 0, column = 0) {
    this.errors.push({
      message,
      line,
      column,
    });
  }

  declareVariable(name, type, value) {
    if (this.symbolTable[name]) {
     
this.addError(
  `Type mismatch: cannot assign ${expressionType} to ${declaredType}.`,
  statement.line,
  statement.column
);
      return;
    }

    this.symbolTable[name] = {
      name,
      type,
      value,
    };
  }

  getVariable(name) {
    return this.symbolTable[name];
  }

  getExpressionType(expression) {

    if (!expression) {
      return null;
    }

    // Integer
    if (expression.type === "IntegerLiteral") {
      return "int";
    }

    // Float
    if (expression.type === "FloatLiteral") {
      return "float";
    }

    // String
    if (expression.type === "StringLiteral") {
      return "string";
    }

    // Boolean
    if (expression.type === "BooleanLiteral") {
      return "boolean";
    }

    // Identifier
    if (expression.type === "Identifier") {

      const variable =
        this.getVariable(expression.name);

      if (!variable) {
        this.addError(
  `Variable '${expression.name}' is not declared.`,
  expression.line || 0,
  expression.column || 0
);

        return null;
      }

      return variable.type;
    }

    // Binary Expression
    if (expression.type === "BinaryExpression") {

      const leftType =
        this.getExpressionType(expression.left);

      const rightType =
        this.getExpressionType(expression.right);

      if (!leftType || !rightType) {
        return null;
      }

      // String concatenation
      if (
        expression.operator === "+" &&
        leftType === "string" &&
        rightType === "string"
      ) {
        return "string";
      }

      // Numeric operations
      if (
        ["+", "-", "*", "/"].includes(
          expression.operator
        )
      ) {

        if (
          (leftType === "int" ||
            leftType === "float") &&
          (rightType === "int" ||
            rightType === "float")
        ) {

          if (
            leftType === "float" ||
            rightType === "float"
          ) {
            return "float";
          }

          return "int";
        }

        this.addError(
          `Invalid operation: ${leftType} ${expression.operator} ${rightType}.`
        );

        return null;
      }
    }

    return null;
  }

  analyzeVariableDeclaration(statement) {

    const variableName =
      statement.identifier;

    const declaredType =
      statement.dataType;

    const expressionType =
      this.getExpressionType(statement.value);

    if (!expressionType) {
      return;
    }

    // Type checking
    if (
      declaredType !== expressionType
    ) {

      // Allow int to float conversion
      if (
        declaredType === "float" &&
        expressionType === "int"
      ) {
        // Valid conversion
      } else {

        this.addError(
          `Type mismatch: cannot assign ${expressionType} to ${declaredType}.`
        );

        return;
      }
    }

    // Get actual value when possible
    let value = null;

    if (
      statement.value.type ===
      "IntegerLiteral"
    ) {
      value = statement.value.value;
    }

    if (
      statement.value.type ===
      "FloatLiteral"
    ) {
      value = statement.value.value;
    }

    if (
      statement.value.type ===
      "StringLiteral"
    ) {
      value = statement.value.value;
    }

    if (
      statement.value.type ===
      "BooleanLiteral"
    ) {
      value = statement.value.value;
    }

    this.declareVariable(
      variableName,
      declaredType,
      value
    );
  }

  analyze() {

    if (!this.ast) {
      return {
        symbolTable: {},
        errors: [],
      };
    }

    for (
      const statement of this.ast.body
    ) {

      if (
        statement.type ===
        "VariableDeclaration"
      ) {

        this.analyzeVariableDeclaration(
          statement
        );
      }
    }

    return {
      symbolTable: this.symbolTable,
      errors: this.errors,
    };
  }
}

export default SemanticAnalyzer;