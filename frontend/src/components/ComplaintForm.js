import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;
const USER_ZOOM = 15;

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat != null && center.lng != null) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [map, center?.lat, center?.lng, zoom]);
  return null;
}

function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    if (mapRef) mapRef.current = map;
    return () => {
      if (mapRef) mapRef.current = null;
    };
  }, [mapRef, map]);
  return null;
}

function LocationMarker({ setLocation }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected complaint location</Popup>
    </Marker>
  );
}

export default function ComplaintForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    issueType: 'pothole',
    description: '',
    address: '',
    image: '',
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [userCoords, setUserCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setMapCenter(coords);
        setMapZoom(USER_ZOOM);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleUseMyLocation = () => {
    if (userCoords) {
      setLocation({ lat: userCoords.lat, lng: userCoords.lng });
      setMapCenter(userCoords);
      setMapZoom(USER_ZOOM);
      if (mapRef.current) {
        mapRef.current.setView([userCoords.lat, userCoords.lng], USER_ZOOM);
      }
    } else if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserCoords(coords);
          setLocation(coords);
          setMapCenter(coords);
          setMapZoom(USER_ZOOM);
          if (mapRef.current) {
            mapRef.current.setView([coords.lat, coords.lng], USER_ZOOM);
          }
          setLocationLoading(false);
        },
        () => setLocationLoading(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!location) {
        toast.error('Please select a location on the map');
        setLoading(false);
        return;
      }

      const complaintData = {
        issueType: formData.issueType,
        description: formData.description,
        address: formData.address,
        latitude: location.lat,
        longitude: location.lng,
        image: formData.image,
      };

      const response = await api.post('/complaints', complaintData);
      toast.success('Complaint registered successfully!');
      setFormData({
        issueType: 'pothole',
        description: '',
        address: '',
        image: '',
      });
      setLocation(null);

      setTimeout(() => {
        onSuccess && onSuccess(response.data.complaint);
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create complaint';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Register a New Complaint</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Issue Type</label>
          <select
            name="issueType"
            value={formData.issueType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage Overflow</option>
            <option value="streetlight">Broken Streetlight</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="public_safety">Public Safety</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter location address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail (minimum 10 characters)"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
            required
            minLength="10"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-2">Upload Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="mt-2 h-32 w-32 object-cover rounded-lg"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="block text-gray-700 font-semibold dark:text-gray-300">
              Select Location on Map (click on map to mark complaint location)
            </label>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium disabled:opacity-50"
            >
              {locationLoading ? 'Getting location…' : 'Use my location'}
            </button>
          </div>
          {locationLoading && (
            <p className="text-sm text-muted-foreground mb-2">Getting your location…</p>
          )}
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={mapZoom}
            className="h-96 rounded-lg border border-gray-300 dark:border-gray-600"
          >
            <MapRefSetter mapRef={mapRef} />
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker setLocation={setLocation} />
          </MapContainer>
          {location && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition font-semibold disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Complaint'}
        </button>
      </form>
    </div>
  );
}
