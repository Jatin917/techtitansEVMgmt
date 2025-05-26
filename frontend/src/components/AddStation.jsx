import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api'
import Papa from 'papaparse';
import axios from 'axios'


const libraries = ['places']
const mapContainerStyle = {
  width: '100%',
  height: '400px',
}
const defaultCenter = {
  lat: 0,
  lng: 0,
}

// Marker icons
const existingPortIcon = {
  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
}

const predictedPortIcon = {
  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
}

const newPortIcon = {
  url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
}

export default function AddStation() {
  const navigate = useNavigate()
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [formData, setFormData] = useState({
port_id: 'UID-' + Math.random().toString(36).substring(2, 10), // or any default logic
  station_id: 'STN-' + Math.random().toString(36).substring(2, 10),
    name: '',
    address: '',
    coordinates: null,
    type: 'standard',
    status: 'active',
    connectors: 2,
    powerOutput: 50,
    pricePerKwh: 0.30,
    operatingHours: '24/7',
    amenities: []
  })

  const [manualCoords, setManualCoords] = useState({
    lat: '',
    lng: ''
  })
  const [map, setMap] = useState(null)
  const [autocomplete, setAutocomplete] = useState(null)
  const autocompleteRef = useRef(null)
  
  // New state for toggle and predicted locations
  const [viewMode, setViewMode] = useState('existing') // 'existing' or 'predicted'
  const [nLocations, setNLocations] = useState(1)
  const [existingPorts, setExistingPorts] = useState([])
  const [predictedPorts, setPredictedPorts] = useState([])
  const [loading, setLoading] = useState(false)
  const [csvData, setCsvData] = useState([]);
  const [newRow, setNewRow] = useState([{

  }])


const getCSVRowObject = (formData) => {
  const {
    port_id, name, address, coordinates, type, status,
    connectors, powerOutput, pricePerKwh
  } = formData;

  const latitude = coordinates?.lat || '';
  const longitude = coordinates?.lng || '';

  const row = {
    uid: port_id,
    name: name,
    vendor_name: 'VendorX',
    address: address,
    latitude: latitude,
    longitude: longitude,
    city: 'Unknown City',
    country: 'Unknown Country',
    open: '09:00',
    close: '21:00',
    logo_url: 'https://example.com/logo.png',
    staff: Math.floor(Math.random() * 4) + 1, // 1-4
    payment_modes: 'UPI,CARD,CASH',
    contact_numbers: '9876543210',
    station_type: 'public',
    postal_code: '560001',
    zone: 'Zone A',
    '0': 'NA',
    available: status === 'active' ? 1 : 0,
    capacity: connectors,
    cost_per_unit: pricePerKwh,
    power_type: powerOutput > 50 ? 'DC' : 'AC',
    total: connectors,
    type: type,
    vehicle_type: 'EV'
  };

  return row;
};


const handleAddRow = (formData) => {
  const newRowObj = getCSVRowObject(formData);

  // Append to state (optional)
  const updatedData = [...csvData, newRowObj];
  setCsvData(updatedData);

  // You can now send newRowObj directly in a POST request to backend
  return newRowObj;
};

  

  // load existing ev station
  useEffect(() => {
    const loadExistingPorts = async () => {
      try {
        const data = await fetch(`${import.meta.env.VITE_BASE_URL_BACKEND}/admin/allstations`);
        const response = await data.json()
        setExistingPorts(response.data);
        console.log("returned values ", response)
      } catch (error) {
        console.error('Error loading existing ports:', error);
      }
    };
  
    loadExistingPorts();
  }, []);
  console.log("existing ports are ", existingPorts)
  // Fetch predicted locations when viewMode changes to predicted
  useEffect(() => {
    console.log
    if (viewMode === 'predicted' && formData.coordinates) {
      fetchPredictedLocations()
    }
  }, [viewMode, nLocations, formData.coordinates])

  const fetchPredictedLocations = async () => {
    if (!formData.coordinates) return
    
    setLoading(true)
    try {
      console.log("predicted one khula")
      const response = await fetch(`${import.meta.env.VITE_BASE_URL_PYTHON_BACKEND}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n_locations: nLocations,
          min_distance_km: 1,
          // You might want to include the current coordinates as reference
          reference_lat: formData.coordinates.lat,
          reference_lng: formData.coordinates.lng
        })
      })
      
      const data = await response.json()
      // Assuming the API returns an array of {lat, lng} objects
      setPredictedPorts(data.predictions || [])
      console.log("predicted one khula" , data.predictions)
    } catch (error) {
      console.error('Error fetching predicted locations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle map click to set coordinates
  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    
    setFormData(prev => ({
      ...prev,
      coordinates: { lat, lng }
    }))

    setManualCoords({
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    })

    // Reverse geocode to get address
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setFormData(prev => ({
            ...prev,
            address: results[0].formatted_address
          }))
        }
      })
    }
  }, [])

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace()
      if (!place.geometry) {
        console.log("No geometry available for this place")
        return
      }

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      setFormData(prev => ({
        ...prev,
        address: place.formatted_address,
        coordinates: { lat, lng }
      }))

      setManualCoords({
        lat: lat.toFixed(6),
        lng: lng.toFixed(6)
      })

      // Pan map to selected location
      if (map) {
        map.panTo({ lat, lng })
        map.setZoom(15)
      }
    }
  }

  // Handle manual coordinate input
  const handleManualCoordChange = (e) => {
    const { name, value } = e.target
    setManualCoords(prev => ({
      ...prev,
      [name]: value
    }))

    // Update form data if coordinates are valid
    const lat = parseFloat(manualCoords.lat)
    const lng = parseFloat(manualCoords.lng)
    if (!isNaN(lat) && !isNaN(lng)) {
      setFormData(prev => ({
        ...prev,
        coordinates: { lat, lng }
      }))
    }
  }

  // Apply manual coordinates when user presses Enter or leaves field
  const applyManualCoords = () => {
    const lat = parseFloat(manualCoords.lat)
    const lng = parseFloat(manualCoords.lng)

    if (!isNaN(lat) && !isNaN(lng)) {
      setFormData(prev => ({
        ...prev,
        coordinates: { lat, lng }
      }))

      // Pan map to new coordinates
      if (map) {
        map.panTo({ lat, lng })
        map.setZoom(15)
      }

      // Reverse geocode to get address
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setFormData(prev => ({
              ...prev,
              address: results[0].formatted_address
            }))
          }
        })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        amenities: checked 
          ? [...prev.amenities, value]
          : prev.amenities.filter(item => item !== value)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    // console.log('Form submitted:')
    await axios.post(`${import.meta.env.VITE_BASE_URL_PYTHON_BACKEND}/add_station`,{"latitude":formData.coordinates.lat, "longitude":formData.coordinates.lng});
    // console.log("hello")
    await axios.post(`${import.meta.env.VITE_BASE_URL_BACKEND}/admin/add-station`, formData);
    // console.log("hello jii")
     const row = handleAddRow(formData)
     console.log("row to be added ", row);
     await axios.post(`${import.meta.env.VITE_BASE_URL_BACKEND}/admin/addrowstation`, row);
    // Here you would typically send data to your API
    navigate('/stations')
  }

  const onLoad = useCallback((map) => {
    // Set initial view to user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          map.panTo(userLocation)
          map.setZoom(12)
        },
        () => {
          // Default to some coordinates if geolocation fails
          map.panTo({ lat: 20, lng: 0 })
          map.setZoom(2)
        }
      )
    } else {
      // Browser doesn't support Geolocation
      map.panTo({ lat: 20, lng: 0 })
      map.setZoom(2)
    }
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])


  const handleViewModeChange = (mode) => {
    setViewMode(mode)
  }

  const handleNLocationsChange = (e) => {
    const value = Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
    setNLocations(value)
  }


  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading maps...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Station</h1>
        <button 
          onClick={() => navigate('/stations')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
        >
          Back to Stations
        </button>
      </div>
  
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                <Autocomplete
                  onLoad={autocomplete => setAutocomplete(autocomplete)}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                    ref={autocompleteRef}
                  />
                </Autocomplete>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    name="lat"
                    step="any"
                    value={manualCoords.lat}
                    onChange={handleManualCoordChange}
                    onBlur={applyManualCoords}
                    onKeyDown={(e) => e.key === 'Enter' && applyManualCoords()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. 37.7749"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    name="lng"
                    step="any"
                    value={manualCoords.lng}
                    onChange={handleManualCoordChange}
                    onBlur={applyManualCoords}
                    onKeyDown={(e) => e.key === 'Enter' && applyManualCoords()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g. -122.4194"
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charger Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="standard">Standard (Level 2)</option>
                  <option value="fast">Fast Charging (DC)</option>
                  <option value="ultra-fast">Ultra-Fast Charging</option>
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            {/* Technical Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Technical Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Connectors*</label>
                <input
                  type="number"
                  name="connectors"
                  min="1"
                  max="10"
                  value={formData.connectors}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Power Output (kW)*</label>
                <input
                  type="number"
                  name="powerOutput"
                  min="10"
                  max="350"
                  value={formData.powerOutput}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per kWh ($)*</label>
                <input
                  type="number"
                  name="pricePerKwh"
                  min="0"
                  step="0.01"
                  value={formData.pricePerKwh}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours*</label>
                <input
                  type="text"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>
            {/* Map Section with Toggle */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Location</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex bg-gray-200 rounded-lg p-1">
                    <button 
                      type="button"
                      className={`px-3 py-1 rounded-md ${viewMode === 'existing' ? 'bg-white shadow-sm' : ''}`}
                      onClick={() => handleViewModeChange('existing')}
                    >
                      Existing Ports
                    </button>
                    <button 
                      type="button"
                      className={`px-3 py-1 rounded-md ${viewMode === 'predicted' ? 'bg-white shadow-sm' : ''}`}
                      onClick={() => handleViewModeChange('predicted')}
                    >
                      Predicted Ports
                    </button>
                  </div>
  
                  {viewMode === 'predicted' && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">Number of locations:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={nLocations}
                        onChange={handleNLocationsChange}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
  
              <p className="text-sm text-gray-600 mb-2">
                {viewMode === 'existing' 
                  ? "Showing existing charging stations"
                  : "Showing predicted optimal locations"}
              </p>
  
              <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={formData.coordinates || defaultCenter}
                  zoom={formData.coordinates ? 12 : 2}
                  onClick={handleMapClick}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  options={{
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true
                  }}
                >
                  {/* New station marker */}
                  {formData.coordinates && (
                    <Marker 
                      position={formData.coordinates} 
                      icon={newPortIcon}
                    />
                  )}
  
                  {/* Existing ports markers */}
                  {viewMode === 'existing' && existingPorts  && existingPorts.map((port, index) => (
                    <Marker
                      key={`existing-${index}`}
                      position={port.coordinates}
                      icon={existingPortIcon}
                    />
                  ))}
  
                  {/* Predicted ports markers */}
                  {viewMode === 'predicted' && predictedPorts.map((port, index) => (
                    <Marker
                      key={`predicted-${index}`}
                      position={{
                        lat: port.latitude,  // Use `latitude` as `lat`
                        lng: port.longitude  // Use `longitude` as `lng`
                      }}
                      icon={predictedPortIcon}
                    />
                  ))}
                </GoogleMap>
              </div>
  
              {formData.coordinates && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
  
            {/* Amenities */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {['Restrooms', 'Cafe', 'WiFi', 'Parking', 'Shop', 'Restaurant', 'Lounge', 'EV Service', 'ATM', 'Accessible'].map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      name="amenities"
                      value={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
  
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/stations')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save Station
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
}