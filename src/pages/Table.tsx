export default function Table() {
  const rows = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Table Page</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rows.map((r) => (
              <tr key={r.id} className="bg-white dark:bg-gray-900">
                <td className="px-4 py-2 text-sm">{r.id}</td>
                <td className="px-4 py-2 text-sm">{r.name}</td>
                <td className="px-4 py-2 text-sm">{r.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
