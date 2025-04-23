import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import StationList from './components/StationList'
import AddStation from './components/AddStation'
import StationDetails from './components/StationDetails'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300`}>
          <div className="p-4 flex items-center justify-between border-b border-gray-700">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold">EV Station Manager</h1>
            ) : (
              <h1 className="text-xl font-bold">EV</h1>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-700"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
          <nav className="p-2">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                >
                  <span className="mr-3">🏠</span>
                  {sidebarOpen && <span>Dashboard</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/stations" 
                  className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                >
                  <span className="mr-3">⚡</span>
                  {sidebarOpen && <span>Stations</span>}
                </Link>
              </li>
              <li>
                <Link 
                  to="/add-station" 
                  className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                >
                  <span className="mr-3">➕</span>
                  {sidebarOpen && <span>Add Station</span>}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stations" element={<StationList />} />
              <Route path="/add-station" element={<AddStation />} />
              <Route path="/stations/:id" element={<StationDetails />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}