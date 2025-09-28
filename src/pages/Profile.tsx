export default function Profile() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Your Profile</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          This is a placeholder profile page. Add your profile details and settings here.
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <form className="space-y-3 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm" placeholder="john@example.com" />
          </div>
          <button type="button" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
