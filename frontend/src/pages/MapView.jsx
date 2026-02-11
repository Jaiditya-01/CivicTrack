import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '../components/ui/button';
import { Icons } from '../components/ui/icons';
import api from '../lib/api';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Default center (India) if geolocation fails
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;
const USER_ZOOM = 14;

// Component to handle map view changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat != null && center.lng != null) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [map, center?.lat, center?.lng, zoom]);
  return null;
}

export default function MapView() {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const locationState = useLocation().state;
  const mapRef = useRef();

  // Request device location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message || 'Could not get your location. Using default view.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Fetch complaints from API
  const { data: complaints = [] } = useQuery(
    ['allComplaintsMap'],
    async () => {
      const response = await api.get('/complaints?limit=100');
      return response.data.complaints || [];
    },
    { staleTime: 3 * 60 * 1000 }
  );

  // Only show complaints that have valid location coordinates
  const complaintsWithLocation = complaints.filter(
    (c) =>
      c.location &&
      typeof c.location.latitude === 'number' &&
      typeof c.location.longitude === 'number'
  );

  const filteredComplaints =
    filter === 'all'
      ? complaintsWithLocation
      : complaintsWithLocation.filter((c) => c.status === filter);

  // Component to handle map events and store the map instance
  function MapController() {
    const map = useMap();
    
    useEffect(() => {
      if (map) {
        mapRef.current = map;
      }
      
      return () => {
        mapRef.current = null;
      };
    }, [map]);
    
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Complaints Map</h1>
          <p className="text-muted-foreground">
            View reported issues in your area. Your location is shown in blue.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {locationLoading && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Icons.loader2 className="h-4 w-4 animate-spin" />
              Getting location…
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.flyTo([userLocation.lat, userLocation.lng], USER_ZOOM);
              }
            }}
            disabled={locationLoading}
          >
            <Icons.navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link to="/complaints/new">
              <Icons.plus className="h-4 w-4 mr-2" />
              New Complaint
            </Link>
          </Button>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {locationError && (
        <div className="mb-4 px-4 py-2 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">
          {locationError}
        </div>
      )}

      {locationState?.openNewComplaint && (
        <div className="mb-4 px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm flex items-center justify-between">
          <span>Report an issue at your current location?</span>
          <Button variant="outline" size="sm" asChild>
            <Link to="/complaints/new">Add complaint</Link>
          </Button>
        </div>
      )}

      <div className="flex-1 relative min-h-[400px]">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={locationLoading ? 4 : USER_ZOOM}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          zoomControl={false}
        >
          <ChangeView
            center={userLocation}
            zoom={locationLoading ? DEFAULT_ZOOM : USER_ZOOM}
          />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User location marker */}
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              html: `<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>`,
              className: 'bg-transparent border-none',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>

          {/* Complaint markers */}
          {filteredComplaints.map((complaint) => (
            <Marker 
              key={complaint._id}
              position={[complaint.location.latitude, complaint.location.longitude]}
              eventHandlers={{
                click: () => setSelectedComplaint(complaint),
              }}
              icon={L.divIcon({
                html: `
                  <div class="relative">
                    <div class="w-6 h-6 ${getStatusColor(complaint.status)} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                      •
                    </div>
                    <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                  </div>
                `,
                className: 'bg-transparent border-none',
                iconSize: [24, 24],
                iconAnchor: [12, 30],
              })}
            >
              <Popup>
                <div className="space-y-1 min-w-[160px]">
                  <h4 className="font-medium capitalize">{complaint.issueType?.replace('_', ' ') || 'Complaint'}</h4>
                  <p className="text-sm text-muted-foreground">{complaint.location?.address || 'Address not set'}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    complaint.status === 'resolved' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : complaint.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Side panel for selected complaint */}
        {selectedComplaint && (
          <div className="absolute top-4 right-4 w-80 bg-background rounded-lg shadow-lg border overflow-hidden z-[1000]">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg capitalize">{selectedComplaint.issueType.replace('_', ' ')}</h3>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icons.x className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  selectedComplaint.status === 'resolved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : selectedComplaint.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {selectedComplaint.status.replace('_', ' ')}
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
                <div className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                {selectedComplaint.description}
              </p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm">{selectedComplaint.location?.address || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="text-sm">
                    {selectedComplaint.location?.latitude?.toFixed(4)}, {selectedComplaint.location?.longitude?.toFixed(4)}
                  </p>
                </div>
                {selectedComplaint.complaintId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Complaint ID</p>
                    <p className="text-sm font-mono">{selectedComplaint.complaintId}</p>
                  </div>
                )}
              </div>
              <Button className="w-full mt-4" asChild>
                <Link to={`/complaints/${selectedComplaint._id}`}>
                  <Icons.eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
