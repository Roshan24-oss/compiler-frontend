function ASTNode({ node, label }) {
  if (node === null || node === undefined) {
    return null;
  }

  // Primitive value
  if (
    typeof node !== "object"
  ) {
    return (
      <div className="ml-6 text-gray-300">
        <span className="text-gray-500">
          {label}:
        </span>{" "}
        <span className="text-white">
          {String(node)}
        </span>
      </div>
    );
  }

  // Array
  if (Array.isArray(node)) {
    return (
      <div className="ml-4">
        {node.map((item, index) => (
          <ASTNode
            key={index}
            node={item}
            label={`[${index}]`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="ml-4 border-l border-gray-700 pl-4">

      {Object.entries(node).map(([key, value]) => {

        // Don't show internal empty values
        if (
          value === null ||
          value === undefined
        ) {
          return null;
        }

        // Object node
        if (
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          return (
            <div key={key} className="mb-3">

              <div className="text-blue-400 font-semibold">
                {key}
              </div>

              <ASTNode
                node={value}
                label={key}
              />

            </div>
          );
        }

        // Array node
        if (Array.isArray(value)) {
          return (
            <div key={key} className="mb-3">

              <div className="text-purple-400 font-semibold">
                {key}
              </div>

              {value.map((item, index) => (
                <ASTNode
                  key={index}
                  node={item}
                  label={`Statement ${index + 1}`}
                />
              ))}

            </div>
          );
        }

        // Primitive value
        return (
          <div
            key={key}
            className="ml-4 mb-1"
          >
            <span className="text-gray-500">
              {key}:
            </span>{" "}

            <span className="text-green-400">
              {String(value)}
            </span>
          </div>
        );
      })}

    </div>
  );
}


function ASTViewer({ ast }) {

  if (!ast) {
    return (
      <div className="text-gray-500 text-center py-10">
        Compile your code to generate the AST.
      </div>
    );
  }

  return (
    <div className="bg-gray-950 rounded-lg p-5 overflow-auto max-h-[500px]">

      <div className="text-xl font-bold text-white mb-4">
        🌳 Abstract Syntax Tree
      </div>

      <div className="text-yellow-400 font-bold">
        Program
      </div>

      <ASTNode
        node={ast}
        label="Program"
      />

    </div>
  );
}

export default ASTViewer;