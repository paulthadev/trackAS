

/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import toast from "react-hot-toast";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapModal = ({ onClose, onSelectLocation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const markerRef = useRef(null);
  const mapRef = useRef();

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            format: "json",
            lat: lat,
            lon: lng,
          },
        }
      );
      return response.data.display_name;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Location selected";
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 18);
        }
        
        const name = await reverseGeocode(lat, lng);
        setSelectedPosition({ lat, lng });
        setLocationName(name);
        
        if (markerRef.current) {
          markerRef.current.remove();
        }

        const marker = L.marker([lat, lng]).addTo(mapRef.current);
        marker.bindPopup(`📍 ${name}`).openPopup();
        markerRef.current = marker;
        
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error("Failed to get location");
        setIsGettingLocation(false);
      }
    );
  };

  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;
      
      mapRef.current = map;

      const handleClick = async (e) => {
        const { lat, lng } = e.latlng;
        
        setSelectedPosition({ lat, lng });
        const name = await reverseGeocode(lat, lng);
        setLocationName(name);
        onSelectLocation(name, { lat, lng });

        if (markerRef.current) {
          markerRef.current.remove();
        }

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`📍 ${name}`).openPopup();
        markerRef.current = marker;

        map.setView([lat, lng]);
      };

      map.on("click", handleClick);

      return () => {
        map.off("click", handleClick);
      };
    }, [map]);

    return null;
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(locationName, selectedPosition);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-11/12 max-w-5xl h-4/5 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Select Class Location
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={isGettingLocation || loading}
          >
            {isGettingLocation ? "Getting Location..." : "Use My Location"}
          </button>
        </div>

        <div className="flex-grow rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={[12.9716, 77.5946]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => {
              mapRef.current = map;
            }}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
          </MapContainer>
        </div>

        {selectedPosition && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{locationName}</p>
                <div className="flex gap-4 mt-1">
                  <div className="text-sm">
                    <span className="text-gray-600">Lat: </span>
                    <span className="font-mono">{selectedPosition.lat.toFixed(6)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Lng: </span>
                    <span className="font-mono">{selectedPosition.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? "Loading..." : "Confirm Location"}
              </button>
            </div>
          </div>
        )}

        {!selectedPosition && (
          <div className="mt-4 text-center text-gray-500">
            Click on the map to select a location
          </div>
        )}
      </div>
    </div>
  );
};

 export default MapModal;