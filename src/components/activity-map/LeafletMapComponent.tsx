import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface Location {
  id: number;
  lat: number;
  lon: number;
  title: string;
  location: string;
}

interface LeafletMapComponentProps {
  locations: Location[];
  selectedLocation: Location | null;
  onMarkerClick: (location: Location) => void;
}

const LeafletMapComponent: React.FC<LeafletMapComponentProps> = ({ locations, selectedLocation, onMarkerClick }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{[key: number]: L.Marker}>({});
  const [map, setMap] = useState<L.Map | null>(null);
    const defaultCenter = useMemo<[number, number]>(() => [40.4168, -3.7038], []);

  useEffect(() => {
    if (!mapRef.current) {
      const initialCenter = locations.length > 0 
        ? [locations[0].lat, locations[0].lon] 
        : defaultCenter;
        
      const mapInstance = L.map('map', {
        center: initialCenter as L.LatLngExpression,
        zoom: 12,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      setMap(mapInstance);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };  }, []);
  useEffect(() => {
    if (!map) return;

    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (locations.length === 0) {
      map.setView(defaultCenter, 12);      return;
    }

    const bounds = L.latLngBounds([]);
    
    locations.forEach(loc => {
      const position = [loc.lat, loc.lon] as [number, number];
      const marker = L.marker(position, { icon: DefaultIcon })
        .addTo(map)
        .bindPopup(`
          <div>
            <h3 class="font-medium">${loc.title}</h3>
            <p class="text-sm">${loc.location}</p>
          </div>
        `);
        
      marker.on('click', () => {
        onMarkerClick(loc);
      });
      
      markersRef.current[loc.id] = marker;
      bounds.extend(position);
    });

    if (locations.length > 1) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        animate: true,
        duration: 1
      });
    } else    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lon], 14);
    }
  }, [locations, map, defaultCenter, onMarkerClick]);

  useEffect(() => {
    if (!map || !selectedLocation) return;
    
    map.setView([selectedLocation.lat, selectedLocation.lon], 14, {
      animate: true,
      duration: 1
    });
    
    const marker = markersRef.current[selectedLocation.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedLocation, map]);

  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  return (
    <>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
      
      {/* Add zoom controls separately */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="flex flex-col gap-2 bg-white rounded-md shadow-md">
          <button 
            className="p-2 hover:bg-gray-100 rounded-t-md border-b" 
            onClick={handleZoomIn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
          <button 
            className="p-2 hover:bg-gray-100 rounded-b-md" 
            onClick={handleZoomOut}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default LeafletMapComponent;
