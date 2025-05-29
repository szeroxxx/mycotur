"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, X } from "lucide-react";
import type L from "leaflet";

interface DirectionsMapProps {
  eventLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
}

interface LocationIQStep {
  maneuver: {
    instruction?: string;
    type?: string;
  };
  distance: number;
  duration: number;
}

interface LocationIQLeg {
  steps: LocationIQStep[];
}

interface LocationIQRoute {
  legs: LocationIQLeg[];
  geometry: {
    coordinates: [number, number][];
  };
  distance: number;
  duration: number;
}

interface LocationIQResponse {
  routes: LocationIQRoute[];
}

const LeafletMapComponent: React.FC<{
  userLocation: { lat: number; lng: number } | null;
  eventLocation: { coordinates: { lat: number; lng: number } };
  routeGeometry: [number, number][];
}> = ({ userLocation, eventLocation, routeGeometry }) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    const initMap = async () => {
      if (typeof window === "undefined") return;

      const L = (await import("leaflet")).default;

      // Import CSS dynamically
      if (typeof window !== "undefined") {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Fix for default markers
      const iconDefault = L.Icon.Default.prototype as unknown as {
        _getIconUrl?: string;
      };
      delete iconDefault._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      if (!mapRef.current) {
        if (
          isNaN(eventLocation.coordinates.lat) ||
          isNaN(eventLocation.coordinates.lng)
        ) {
          console.error(
            "Invalid event location coordinates",
            eventLocation.coordinates
          );
          return;
        }

        const defaultCenter: [number, number] = userLocation
          ? [userLocation.lat, userLocation.lng]
          : [eventLocation.coordinates.lat, eventLocation.coordinates.lng];

        const map = L.map("directions-map", {
          center: defaultCenter,
          zoom: 13,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapRef.current = map;
        setMapLoaded(true);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);
  useEffect(() => {
    const updateMap = async () => {
      if (!mapLoaded || !mapRef.current) return;

      const L = (await import("leaflet")).default;
      const map = mapRef.current;

      map.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });
      const eventMarker = L.marker([
        eventLocation.coordinates.lat,
        eventLocation.coordinates.lng,
      ])
        .addTo(map)
        .bindPopup("Event Location");

      if (userLocation) {
        // Validate user location coordinates
        if (isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
          console.warn("Invalid user location coordinates", userLocation);
          map.setView(
            [eventLocation.coordinates.lat, eventLocation.coordinates.lng],
            13
          );
          return;
        }

        const userMarker = L.marker([userLocation.lat, userLocation.lng])
          .addTo(map)
          .bindPopup("Your Location");

        if (routeGeometry.length > 0) {
          L.polyline(routeGeometry, {
            color: "rgba(229,114,0)",
            weight: 4,
            opacity: 0.8,
          }).addTo(map);

          const group = L.featureGroup([userMarker, eventMarker]);
          map.fitBounds(group.getBounds().pad(0.1));
        } else {
          const group = L.featureGroup([userMarker, eventMarker]);
          map.fitBounds(group.getBounds().pad(0.1));
        }
      } else {
        map.setView(
          [eventLocation.coordinates.lat, eventLocation.coordinates.lng],
          13
        );
      }
    };

    updateMap();
  }, [
    mapLoaded,
    userLocation,
    eventLocation.coordinates.lat,
    eventLocation.coordinates.lng,
    routeGeometry,
  ]);

  return <div id="directions-map" className="w-full h-full" />;
};

const LeafletMap = dynamic(() => Promise.resolve(LeafletMapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
});

const DirectionsMap: React.FC<DirectionsMapProps> = ({
  eventLocation,
  isOpen,
  onClose,
}) => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [route, setRoute] = useState<RouteStep[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  const getUserLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setError(
            "Unable to get your location. Please enable location services."
          );
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);
  const getDirections = useCallback(async () => {
    if (!userLocation) return;

    if (isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      setError("Invalid user location coordinates");
      return;
    }

    if (
      isNaN(eventLocation.coordinates.lat) ||
      isNaN(eventLocation.coordinates.lng)
    ) {
      setError("Invalid event location coordinates");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY;
      if (!apiKey) {
        throw new Error("LocationIQ API key not configured");
      }

      const url = `https://us1.locationiq.com/v1/directions/driving/${userLocation.lng},${userLocation.lat};${eventLocation.coordinates.lng},${eventLocation.coordinates.lat}?key=${apiKey}&steps=true&geometries=geojson&overview=full`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to get directions: ${response.statusText}`);
      }

      const data: LocationIQResponse = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setTotalDistance(route.distance);
        setTotalDuration(route.duration);

        if (route.geometry && route.geometry.coordinates) {
          const coords: [number, number][] = route.geometry.coordinates.map(
            (coord) => [coord[1], coord[0]]
          );
          setRouteGeometry(coords);
        }

        const steps: RouteStep[] = [];
        route.legs.forEach((leg) => {
          leg.steps.forEach((step) => {
            steps.push({
              instruction: step.maneuver.instruction || "Continue",
              distance: step.distance,
              duration: step.duration,
              maneuver: step.maneuver.type || "straight",
            });
          });
        });
        setRoute(steps);
      }
    } catch (error) {
      console.error("Error getting directions:", error);
      setError("Failed to get directions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userLocation, eventLocation]);

  const handleGetDirections = useCallback(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    if (userLocation && isOpen) {
      getDirections();
    }
  }, [userLocation, isOpen, getDirections]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Directions</h2>
            <p className="text-gray-600 text-sm">{eventLocation.address}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex">
          <div className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(229,114,0)] mx-auto mb-2"></div>
                  <p className="text-gray-600">
                    {userLocation
                      ? "Getting directions..."
                      : "Getting your location..."}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center p-4">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={handleGetDirections}
                    className="bg-[rgba(229,114,0)] hover:bg-[rgba(194,91,52)] text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            <LeafletMap
              userLocation={userLocation}
              eventLocation={eventLocation}
              routeGeometry={routeGeometry}
            />

            {!userLocation && !loading && (
              <div className="absolute bottom-4 left-4 z-[1000]">
                <button
                  onClick={handleGetDirections}
                  className="bg-[rgba(229,114,0)] hover:bg-[rgba(194,91,52)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
              </div>
            )}
          </div>

          {userLocation && route.length > 0 && (
            <div className="w-80 border-l bg-gray-50 flex flex-col">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Route Summary</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {formatDistance(totalDistance)}
                  </span>
                  <span className="font-semibold">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {route.map((step, index) => (
                  <div
                    key={index}
                    className="p-3 border-b border-gray-200 hover:bg-white transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[rgba(229,114,0)] text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 mb-1">
                          {step.instruction}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{formatDistance(step.distance)}</span>
                          <span>{formatDuration(step.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectionsMap;
