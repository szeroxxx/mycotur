import React, { useEffect, useRef, useState, useCallback } from "react";
import { googleMapsLoader } from "@/utils/googleMapsLoader";
import { ActivityData } from "@/hooks/useActivitiesData";

interface GoogleMapComponentProps {
  locations: ActivityData[];
  selectedLocation: ActivityData | null;
  onMarkerClick: (location: ActivityData) => void;
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  locations,
  selectedLocation,
  onMarkerClick,
}) => {  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultCenter = { lat: 40.4168, lng: -3.7038 };

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || isLoaded) return;      try {
        await googleMapsLoader.load();

        let initialCenter = defaultCenter;
        if (locations.length > 0) {
          const validLocation = locations.find(
            (loc) => !isNaN(loc.lat) && !isNaN(loc.lon)
          );
          if (validLocation) {
            initialCenter = { lat: validLocation.lat, lng: validLocation.lon };
          }
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        const infoWindow = new google.maps.InfoWindow();

        mapInstanceRef.current = mapInstance;
        infoWindowRef.current = infoWindow;
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initializeMap();
  }, [locations.length]);

  const clearMarkers = useCallback(() => {
    Object.values(markersRef.current).forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = {};
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    clearMarkers();

    if (locations.length === 0) {
      mapInstanceRef.current.setCenter(defaultCenter);
      mapInstanceRef.current.setZoom(12);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    let validLocationCount = 0;

    locations.forEach((loc) => {
      if (isNaN(loc.lat) || isNaN(loc.lon)) {
        console.warn(
          `Skipping marker for "${loc.title}" due to invalid coordinates: lat=${loc.lat}, lon=${loc.lon}`
        );
        return;
      }

      const position = { lat: loc.lat, lng: loc.lon };

      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: loc.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.688 12.5 28.5 12.5 28.5s12.5-18.813 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="#E57200"/>
              <circle cx="12.5" cy="12.5" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(25, 41),
          anchor: new google.maps.Point(12, 41),
        },
      });

      marker.addListener("click", () => {
        onMarkerClick(loc);

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #443f3f;">${loc.title}</h3>
              <p style="margin: 0; font-size: 14px; color: #645c5a;">${loc.location}</p>
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current[loc.id] = marker;
      bounds.extend(position);
      validLocationCount++;
    });

    if (validLocationCount > 1) {
      mapInstanceRef.current.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
    } else if (validLocationCount === 1) {
      const validLocation = locations.find(
        (loc) => !isNaN(loc.lat) && !isNaN(loc.lon)
      );
      if (validLocation) {
        mapInstanceRef.current.setCenter({
          lat: validLocation.lat,
          lng: validLocation.lon,
        });
        mapInstanceRef.current.setZoom(14);
      }
    }
  }, [locations, isLoaded, clearMarkers, onMarkerClick]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !selectedLocation) return;

    if (isNaN(selectedLocation.lat) || isNaN(selectedLocation.lon)) {
      console.warn(
        `Cannot center map on selected location "${selectedLocation.title}" due to invalid coordinates`
      );
      return;
    }

    const position = { lat: selectedLocation.lat, lng: selectedLocation.lon };

    mapInstanceRef.current.panTo(position);
    mapInstanceRef.current.setZoom(14);

    const marker = markersRef.current[selectedLocation.id];
    if (marker && infoWindowRef.current) {
      infoWindowRef.current.setContent(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #443f3f;">${selectedLocation.title}</h3>
          <p style="margin: 0; font-size: 14px; color: #645c5a;">${selectedLocation.location}</p>
        </div>
      `);
      infoWindowRef.current.open(mapInstanceRef.current, marker);
    }
  }, [selectedLocation, isLoaded]);

  return (
    <>
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      />

      {/* Custom zoom controls */}
      {/* <div className="absolute top-4 right-4 z-[1000]">
        <div className="flex flex-col gap-2 bg-[rgba(229,114,0)] rounded-md shadow-md">
          <button
            className="p-2 hover:bg-[rgba(194,91,52)] text-white rounded-t-md border-b border-[rgba(194,91,52)] transition-colors"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-[rgba(194,91,52)] text-white rounded-b-md transition-colors"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div> */}

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(229,114,0)] mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleMapComponent;
