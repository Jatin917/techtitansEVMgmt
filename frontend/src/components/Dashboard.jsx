export default function Dashboard() {
    const stats = [
      { title: "Total Stations", value: "142", change: "+12%", trend: "up" },
      { title: "Active Stations", value: "128", change: "+5%", trend: "up" },
      { title: "In Maintenance", value: "14", change: "-2%", trend: "down" },
      { title: "Total Sessions", value: "2,845", change: "+24%", trend: "up" },
    ]
  
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <div className="flex items-baseline mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className={`ml-2 text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Station ID</th>
                  <th className="text-left py-2 px-4">Location</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">STN-00{item}</td>
                    <td className="py-3 px-4">Location {item}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${item % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item % 2 === 0 ? 'Active' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="py-3 px-4">2{item} minutes ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }