import { Link } from 'react-router-dom'
import { Package, Images, Grid3x3, Settings } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">PIM</h1>
        <p className="text-sm text-gray-600">Product Manager</p>
      </div>

      <ul className="space-y-2">
        <li>
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Package size={20} />
            <span>Products</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/media" 
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Images size={20} />
            <span>Media Library</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/categories" 
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Grid3x3 size={20} />
            <span>Categories</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/settings" 
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}