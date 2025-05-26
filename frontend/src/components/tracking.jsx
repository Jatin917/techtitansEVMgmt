import { useEffect, useState } from 'react';
import { Battery, Clock, Zap, User, DollarSign, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function EVPortTracker() {
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  async function fetchPorts() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL_BACKEND}/admin/ports`);
      setPorts(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchPorts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'idle': return 'bg-blue-100 text-blue-800';
      case 'charging': return 'bg-green-100 text-green-800';
      case 'fault': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePortSelect = (port) => {
    setSelectedPort(port);
  };

  const renderRatingStars = (rating) => {
    if (!rating) return null;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400' : 
                             (i === fullStars && hasHalfStar ? 'text-yellow-400' : 'text-gray-300')}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm font-medium text-gray-500">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderDetailedView = () => {
    if (!selectedPort) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button 
          onClick={() => setSelectedPort(null)}
          className="mb-4 text-blue-600 hover:text-blue-800"
        >
          &larr; Back to all ports
        </button>

        <h2 className="text-2xl font-bold mb-6">{selectedPort.port_id} Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Port Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Station ID:</span>
                <span className="font-medium">{selectedPort.station_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPort.status)}`}>
                  {selectedPort.status?.toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Ping:</span>
                <span className="font-medium">{formatDate(selectedPort.last_ping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Charging Time:</span>
                <span className="font-medium">{selectedPort.avg_time_to_charge_minutes || 0} minutes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Electricity:</span>
                <span className="font-medium">{selectedPort.totalElectricityConsumption || 0} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Energy per Session:</span>
                <span className="font-medium">{selectedPort.averageEneryConsumed || 0} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Traffic (24h):</span>
                <span className="font-medium">{selectedPort.userTraffic?.lastDay || 0} users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Traffic (7d):</span>
                <span className="font-medium">{selectedPort.userTraffic?.last7Days || 0} users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User Traffic (30d):</span>
                <span className="font-medium">{selectedPort.userTraffic?.last30Days || 0} users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Fault Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last 24 Hours</p>
                  <p className="text-xl font-semibold">{selectedPort.lastDayFaultValue || 0}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last 7 Days</p>
                  <p className="text-xl font-semibold">{selectedPort.last7FaultValue || 0}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last 30 Days</p>
                  <p className="text-xl font-semibold">{selectedPort.last30FaultValue || 0}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedPort.vehicle_charges?.length > 0 && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Charging History</h3>
              <div className="bg-gray-50 rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/% </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedPort.vehicle_charges.map((charge, index) => (
                      <tr key={`${charge.session_id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{charge.vehicle_id || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{charge.session_id || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(charge.start_time)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{charge.time_taken_minutes || 0} min</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{charge.charged_percent || 0}%</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{charge.energy_consumed_kWh || 0} kWh</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">₹{charge.electricity_cost || 0}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">₹{charge.cost_per_percent || 0}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {charge.user_rating ? renderRatingStars(charge.user_rating) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Latest Review</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="mb-1">
                      {selectedPort.vehicle_charges[0].user_rating ? 
                        renderRatingStars(selectedPort.vehicle_charges[0].user_rating) : 'No rating'}
                    </div>
                    <p className="text-gray-700">
                      {selectedPort.vehicle_charges[0].review || 'No review available'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      From {selectedPort.vehicle_charges[0].vehicle_id || 'Unknown'} on {formatDate(selectedPort.vehicle_charges[0].end_time)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPortCard = (port) => (
    <div 
      key={port._id}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer
                 ${viewMode === 'list' ? 'p-4' : 'overflow-hidden'}`}
      onClick={() => handlePortSelect(port)}
    >
      {viewMode === 'grid' ? (
        <div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{port.port_id}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(port.status)}`}>
                {port.status?.toUpperCase() || 'N/A'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Avg. Charge Time: <span className="font-medium">{port.avg_time_to_charge_minutes || 0} min</span></span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Total Energy: <span className="font-medium">{port.totalElectricityConsumption || 0} kWh</span></span>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Last 7 Days: <span className="font-medium">{port.userTraffic?.last7Days || 0} users</span></span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-gray-600">Faults (7d): <span className="font-medium">{port.last7FaultValue || 0}</span></span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Last ping: {formatDate(port.last_ping)}
            </div>
          </div>

          {port.vehicle_charges?.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Latest Session</h3>
                <span className="text-sm text-gray-500">{formatDate(port.vehicle_charges[0].end_time)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Battery className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm">{port.vehicle_charges[0].charged_percent || 0}%</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm">{port.vehicle_charges[0].time_taken_minutes || 0} min</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-amber-500 mr-1" />
                  <span className="text-sm">₹{port.vehicle_charges[0].electricity_cost || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              port.status === 'idle' ? 'bg-blue-100' : 
              port.status === 'charging' ? 'bg-green-100' : 
              port.status === 'fault' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {port.status === 'fault' ? (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              ) : (
                <Zap className={`w-6 h-6 ${
                  port.status === 'idle' ? 'text-blue-500' : 
                  port.status === 'charging' ? 'text-green-500' : 'text-gray-500'
                }`} />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">{port.port_id}</h3>
              <p className="text-sm text-gray-500">Station: {port.station_id || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Last Ping</p>
              <p className="text-sm font-medium">{formatDate(port.last_ping)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Energy</p>
              <p className="text-sm font-medium">{port.totalElectricityConsumption || 0} kWh</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Faults (24h/7d/30d)</p>
              <p className="text-sm font-medium">
                {port.lastDayFaultValue || 0}/{port.last7FaultValue || 0}/{port.last30FaultValue || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(port.status)}`}>
                {port.status?.toUpperCase() || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <header className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">EV Port Tracker</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button 
                className={`px-3 py-1 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </header>

      {selectedPort ? (
        renderDetailedView()
      ) : (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {ports.map(renderPortCard)}
        </div>
      )}
    </div>
  );
}