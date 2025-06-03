import React from 'react';
import dynamic from 'next/dynamic';
import { ActivityData } from '@/hooks/useActivitiesData';

const GoogleMapComponent = dynamic<{
  locations: ActivityData[];
  selectedLocation: ActivityData | null;
  onMarkerClick: (location: ActivityData) => void;
}>(() => import('@/components/activity-map/GoogleMapComponent'), {
  ssr: false,
});

interface MapViewProps {
  locations: ActivityData[];
  selectedLocation: ActivityData | null;
  onMarkerClick: (location: ActivityData) => void;
}

const MapView: React.FC<MapViewProps> = ({ locations, selectedLocation, onMarkerClick }) => {
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden">
      <GoogleMapComponent 
        locations={locations}
        selectedLocation={selectedLocation}
        onMarkerClick={onMarkerClick}
      />
    </div>
  );
};

export default MapView;