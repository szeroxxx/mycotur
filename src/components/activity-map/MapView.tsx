import React from 'react';
import dynamic from 'next/dynamic';

const LeafletMapComponent = dynamic<{
  locations: Location[];
  selectedLocation: Location | null;
  onMarkerClick: (location: Location) => void;
}>(() => import('@/components/activity-map/LeafletMapComponent'), {
  ssr: false,
});

interface Location {
  id: number;
  lat: number;
  lon: number;
  title: string;
  location: string;
}

interface MapViewProps {
  locations: Location[];
  selectedLocation: Location | null;
  onMarkerClick: (location: Location) => void;
}

const MapView: React.FC<MapViewProps> = ({ locations, selectedLocation, onMarkerClick }) => {
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden">
      <LeafletMapComponent 
        locations={locations}
        selectedLocation={selectedLocation}
        onMarkerClick={onMarkerClick}
      />
    </div>
  );
};

export default MapView;