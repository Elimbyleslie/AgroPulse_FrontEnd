
interface TableProps {
  columns: string[];                // les en-têtes
  data: Record<string,string[] >[];      
}

export default function Table({ columns, data }: TableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col: string) => (
              <th key={col} className="p-3 font-semibold text-gray-700">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row: Record<string, string[]>, index: number) => (
            <tr key={index} className="border-t">
              {Object.values(row).map((cell: string[], i: number) => (
                <td key={i} className="p-3 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
