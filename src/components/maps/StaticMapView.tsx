import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { googleMapsLoader } from "@/utils/googleMapsLoader";

interface StaticMapViewProps {
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  onGetDirections?: () => void;
}

const StaticMapView: React.FC<StaticMapViewProps> = ({
  location,
  onGetDirections,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current || isLoaded || !location.coordinates) return;

      try {
        await googleMapsLoader.load();

        if (
          isNaN(location.coordinates.lat) ||
          isNaN(location.coordinates.lng)
        ) {
          throw new Error("Invalid coordinates");
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
          },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          disableDefaultUI: true,
          // gestureHandling: "none",
          zoomControl: true,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          draggable: false,        });
        
        new google.maps.Marker({
          position: {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
          },
          map: mapInstance,
          title: location.address,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
                <svg width="36" height="43" viewBox="0 0 36 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C27.9411 0 36 8.05887 36 18C36 26.654 29.8925 33.8799 21.7529 35.6064L17.6289 42.75L13.3867 35.4023C5.68087 33.3649 0 26.3463 0 18C0 8.05887 8.05887 0 18 0Z" fill="#050505"/>
                <path d="M15 16.9997C15 17.7954 15.3161 18.5584 15.8787 19.121C16.4413 19.6836 17.2044 19.9997 18 19.9997C18.7956 19.9997 19.5587 19.6836 20.1213 19.121C20.6839 18.5584 21 17.7954 21 16.9997C21 16.2041 20.6839 15.441 20.1213 14.8784C19.5587 14.3158 18.7956 13.9997 18 13.9997C17.2044 13.9997 16.4413 14.3158 15.8787 14.8784C15.3161 15.441 15 16.2041 15 16.9997Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23.657 22.6567L19.414 26.8997C19.039 27.2743 18.5306 27.4848 18.0005 27.4848C17.4704 27.4848 16.962 27.2743 16.587 26.8997L12.343 22.6567C11.2242 21.5379 10.4623 20.1124 10.1537 18.5606C9.84504 17.0087 10.0035 15.4002 10.609 13.9384C11.2145 12.4767 12.2399 11.2272 13.5555 10.3482C14.8711 9.46918 16.4178 9 18 9C19.5822 9 21.1289 9.46918 22.4445 10.3482C23.7601 11.2272 24.7855 12.4767 25.391 13.9384C25.9965 15.4002 26.155 17.0087 25.8463 18.5606C25.5377 20.1124 24.7758 21.5379 23.657 22.6567Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          },
        });

        mapInstanceRef.current = mapInstance;
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading static map:", error);
        setError("Failed to load map");
      }
    };

    initializeMap();
  }, [location.coordinates, isLoaded]);

  if (error || !location.coordinates) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-[rgba(229,114,0)] rounded-full flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-[rgba(68,63,63)] font-medium">
              {error ? "Map unavailable" : "Location not available"}
            </span>
          </div>
        </div>
        {onGetDirections && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 opacity-50">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[rgba(229,114,0)]" />
              <span className="text-[rgba(68,63,63)] font-medium">
                Directions unavailable
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "192px" }}
      />

      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgba(229,114,0)] mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {onGetDirections && isLoaded && (
        <div
          className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onGetDirections}
        >
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[rgba(229,114,0)]" />
            <span className="text-[rgba(68,63,63)] font-medium">
              Get Directions
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticMapView;
