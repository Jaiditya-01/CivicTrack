import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
      <Popup>Selected location</Popup>
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
          <label className="block text-gray-700 font-semibold mb-2">
            Select Location on Map (Click on map to mark location)
          </label>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="h-96 rounded-lg border border-gray-300"
            ref={mapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker setLocation={setLocation} />
          </MapContainer>
          {location && (
            <p className="mt-2 text-sm text-gray-600">
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
