export default function Form() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Form Page</h1>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
          <input id="name" type="text" className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2" placeholder="Enter name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
          <input id="email" type="email" className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2" placeholder="Enter email" />
        </div>
        <button type="submit" className="rounded-md bg-brand-500 text-white px-4 py-2 hover:bg-brand-600">Submit</button>
      </form>
    </div>
  );
}
