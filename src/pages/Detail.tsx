export default function Detail() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Detail Page</h1>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Name</div>
            <div className="text-gray-900 dark:text-white/90">Alice Johnson</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Email</div>
            <div className="text-gray-900 dark:text-white/90">alice@example.com</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Role</div>
            <div className="text-gray-900 dark:text-white/90">Administrator</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Status</div>
            <div className="text-gray-900 dark:text-white/90">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
