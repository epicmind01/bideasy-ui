export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">Revenue</div>
        <div className="mt-2 text-2xl font-semibold">$24,500</div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">Orders</div>
        <div className="mt-2 text-2xl font-semibold">1,248</div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="text-sm text-gray-500 dark:text-gray-400">Customers</div>
        <div className="mt-2 text-2xl font-semibold">873</div>
      </div>

      <div className="md:col-span-3 mt-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 text-base font-semibold">Recent Activity</div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">New order #1024 created</span>
            <span className="text-gray-500 dark:text-gray-400">2m ago</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">User Jane added to team</span>
            <span className="text-gray-500 dark:text-gray-400">24m ago</span>
          </li>
          <li className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Payout processed</span>
            <span className="text-gray-500 dark:text-gray-400">1h ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
