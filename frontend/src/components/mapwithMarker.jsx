import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Papa from "papaparse";

const containerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "16px",
};

const center = {
  lat: 28.6139,
  lng: 77.2090,
};

const apiKey='AIzaSyDS5pQGPNtJviAO-vAUQnQAq5JunxtpZps'

const MapWithClickHandler = () => {
  const [stations, setStations] = useState([]);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetch("/charging_stations.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => setStations(results.data),
        });
      });
  }, []);

  const handleMapClick = (event) => {
    console.log("Map clicked");
    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();
    setClickedLocation({ latitude, longitude });
    setShowDialog(true);
  };
  

  const handleAddLocation = async () => {
    // Call your backend API
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL_PYTHON_BACKEND}/add_station`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clickedLocation),
      });
      const result = await res.json();
      alert("Location added successfully!");
      setShowDialog(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add location");
    }
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        onClick={handleMapClick}
      >
        {stations.map((station, index) => (
          <Marker
            key={index}
            position={{
              lat: parseFloat(station.latitude),
              lng: parseFloat(station.longitude),
            }}
            title={station.name}
          />
        ))}

        {clickedLocation && (
          <Marker position={clickedLocation} icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png" />
        )}
      </GoogleMap>

      {showDialog && clickedLocation && (
        <div className="fixed bottom-10 left-10 bg-white rounded-xl shadow-xl p-4 w-72 z-50">
          <h2 className="text-lg font-semibold mb-2">Add New Location</h2>
          <p className="text-sm">Latitude: {clickedLocation.lat && clickedLocation.lat.toFixed(6)}</p>
          <p className="text-sm">Longitude: {clickedLocation.lng && clickedLocation.lng.toFixed(6)}</p>
          <button
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            onClick={handleAddLocation}
          >
            Add Location
          </button>
        </div>
      )}
    </LoadScript>
  );
};

export default MapWithClickHandler;
