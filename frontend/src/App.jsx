import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import StationList from './components/StationList'
import AddStation from './components/AddStation'
import StationDetails from './components/StationDetails'
import './App.css'
import Auth from './components/Auth/auth'
// import { auth } from '../../firebase/config'; // Make sure to import your Firebase config
import { signOut } from 'firebase/auth';
import { User, LogOut } from 'lucide-react';
import { auth } from './firebase/firebasePopup'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const user = auth.currentUser;
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - only show if not on Auth page */}
      {location.pathname !== '/Auth' && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 flex flex-col`}>
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
          
          <nav className="p-2 flex-1">
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

          {/* User Profile Section */}
          {user && (
            <div 
              className="p-4 border-t border-gray-700 relative"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              <div className="flex items-center">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="User" 
                    className="w-8 h-8 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                    <User className="w-4 h-4" />
                  </div>
                )}
                
                {sidebarOpen && (
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                )}
              </div>

              {showLogout && (
                <button
                  onClick={handleLogout}
                  className={`
                    absolute bottom-full left-0 right-0 mb-2 mx-4
                    flex items-center justify-center
                    p-2 bg-gray-700 rounded-lg
                    text-sm hover:bg-gray-600 transition-colors
                    ${sidebarOpen ? '' : 'w-12 mx-auto'}
                  `}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {sidebarOpen && 'Logout'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Auth" element={<Auth />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stations" element={<StationList />} />
              <Route path="/add-station" element={<AddStation />} />
              <Route path="/stations/:id" element={<StationDetails />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}