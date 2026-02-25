export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Title: Uses slate-900 for light and slate-50 for dark */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '1,250', change: '+12%', color: 'text-blue-600' },
          { label: 'Revenue', value: '$12,400', change: '+5%', color: 'text-green-600' },
          { label: 'Active Sessions', value: '432', change: '-2%', color: 'text-amber-600' },
          { label: 'Error Rate', value: '0.02%', change: 'Stable', color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
              <span className={`text-xs font-bold ${stat.color}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sample Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-slate-50 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
                  <div className="h-3 w-48 bg-slate-50 dark:bg-slate-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid gap-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 transition-colors">
              + Add New User
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-slate-600 dark:text-slate-400 transition-colors">
              View Audit Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}