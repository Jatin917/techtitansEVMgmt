import { useParams, Link } from 'react-router-dom'
import StationMap from './Map'

// Sample station data - in a real app this would come from an API
const stationData = {
  id: 1,
  name: "Downtown Charger",
  location: "123 Main St, City Center",
  coordinates: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
  type: "Fast Charging (DC)",
  status: "active",
  connectors: 4,
  powerOutput: 150,
  pricePerKwh: 0.35,
  operatingHours: "24/7",
  amenities: ["Restrooms", "Cafe", "Parking"],
  lastMaintenance: "2023-05-15",
  nextMaintenance: "2023-08-15",
  totalSessions: 284,
  avgSessionTime: "45 minutes",
  revenue: 2840.50,
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "USA"
  },
  contact: {
    phone: "(555) 123-4567",
    email: "info@downtowncharger.com"
  },
  operator: "EV Charge Networks",
  installationDate: "2022-03-15",
  lastUpdated: "2023-06-20T14:30:00Z"
}

export default function StationDetails() {
  const { id } = useParams()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Station Details</h1>
          <p className="text-gray-600">ID: STN-{id.padStart(4, '0')}</p>
        </div>
        <Link 
          to="/stations" 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
        >
          Back to Stations
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Station Header */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">{stationData.name}</h2>
              <p className="text-gray-600">{stationData.location}</p>
              <p className="text-sm text-gray-500 mt-1">
                Operated by: {stationData.operator}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stationData.status === 'active' ? 'bg-green-100 text-green-800' :
                stationData.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {stationData.status.charAt(0).toUpperCase() + stationData.status.slice(1)}
              </span>
              <span className="text-sm text-gray-500">
                Last updated: {new Date(stationData.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {/* Basic Information Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
            
            <div>
              <p className="text-sm text-gray-500">Charger Type</p>
              <p className="font-medium">{stationData.type}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Connectors</p>
              <p className="font-medium">{stationData.connectors}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Power Output</p>
              <p className="font-medium">{stationData.powerOutput} kW</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Operating Hours</p>
              <p className="font-medium">{stationData.operatingHours}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Installation Date</p>
              <p className="font-medium">{stationData.installationDate}</p>
            </div>
          </div>

          {/* Maintenance Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Maintenance</h3>
            
            <div>
              <p className="text-sm text-gray-500">Last Maintenance</p>
              <p className="font-medium">{stationData.lastMaintenance}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Next Maintenance</p>
              <p className="font-medium">{stationData.nextMaintenance}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Maintenance Notes</p>
              <p className="font-medium text-gray-600 italic">No issues reported</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Maintenance Contact</p>
              <p className="font-medium">{stationData.contact.phone}</p>
              <p className="font-medium text-blue-600">{stationData.contact.email}</p>
            </div>
          </div>

          {/* Usage Statistics Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Usage Statistics</h3>
            
            <div>
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="font-medium">{stationData.totalSessions.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Average Session Time</p>
              <p className="font-medium">{stationData.avgSessionTime}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="font-medium">${stationData.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Price per kWh</p>
              <p className="font-medium">${stationData.pricePerKwh.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="p-6 border-t">
          <h3 className="font-semibold text-lg mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {stationData.amenities.map((amenity, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
              >
                <span className="mr-1">✅</span> {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Address Section */}
        <div className="p-6 border-t bg-gray-50">
          <h3 className="font-semibold text-lg mb-3">Address Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Street</p>
              <p className="font-medium">{stationData.address.street}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{stationData.address.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">State/Region</p>
              <p className="font-medium">{stationData.address.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ZIP/Postal Code</p>
              <p className="font-medium">{stationData.address.zip}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">{stationData.address.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid - Sessions and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Sessions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All Sessions
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium">Session #{item}</span>
                  <span className="text-sm text-gray-500">{item * 2} hours ago</span>
                </div>
                <div className="text-sm text-gray-600">Duration: {30 + item * 5} minutes</div>
                <div className="text-sm text-gray-600">Energy: {(10 + item * 2).toFixed(2)} kWh</div>
                <div className="text-sm text-gray-600">Cost: ${((10 + item * 2) * stationData.pricePerKwh).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-semibold text-lg">Station Location</h3>
          </div>
          <div className="h-96">
            {stationData.coordinates ? (
              <>
                <StationMap 
                  location={stationData.coordinates} 
                  zoom={15}
                  options={{
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true
                  }}
                />
                <div className="p-4 bg-gray-50 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Coordinates:</span> {stationData.coordinates.lat.toFixed(6)}, {stationData.coordinates.lng.toFixed(6)}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${stationData.coordinates.lat},${stationData.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No location data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Edit Station
        </button>
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Generate Report
        </button>
      </div>
    </div>
  )
}