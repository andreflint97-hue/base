export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Products', value: '0', color: 'bg-blue-500' },
          { label: 'Media Assets', value: '0', color: 'bg-green-500' },
          { label: 'Categories', value: '0', color: 'bg-purple-500' },
          { label: 'Storage Used', value: '0 GB', color: 'bg-orange-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <div className={`${stat.color} h-1 rounded-full mt-4 w-1/3`}></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome</h2>
        <p className="text-gray-600">
          This is your Product Information Manager. Start by uploading products via CSV or adding them manually.
        </p>
      </div>
    </div>
  )
}