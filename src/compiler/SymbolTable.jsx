function SymbolTable({ symbolTable }) {

  const variables =
    Object.values(symbolTable);

  if (variables.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No symbols found.
      </div>
    );
  }

  return (
    <div>

      <h2 className="text-xl font-bold text-white mb-4">
        📋 Symbol Table
      </h2>

      <div className="overflow-auto">

        <table className="w-full text-left">

          <thead className="bg-gray-800">

            <tr>
              <th className="p-3">
                Name
              </th>

              <th className="p-3">
                Type
              </th>

              <th className="p-3">
                Value
              </th>
            </tr>

          </thead>

          <tbody>

            {variables.map(
              (variable, index) => (

                <tr
                  key={index}
                  className="border-t border-gray-800"
                >

                  <td className="p-3 text-blue-400 font-mono">
                    {variable.name}
                  </td>

                  <td className="p-3 text-purple-400">
                    {variable.type}
                  </td>

                  <td className="p-3 text-green-400">
                    {variable.value === null
                      ? "-"
                      : String(variable.value)}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default SymbolTable;