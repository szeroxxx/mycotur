"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  X,
  Route,
  Clock,
  Car,
  MapIcon,
} from "lucide-react";
import { googleMapsLoader } from "@/utils/googleMapsLoader";
declare global {
  interface Window {
    google?: typeof google;
  }
}

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

const GoogleDirectionsMap: React.FC<DirectionsMapProps> = ({
  eventLocation,
  isOpen,
  onClose,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(
    null
  );
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null
  );

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [route, setRoute] = useState<RouteStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDistance, setTotalDistance] = useState<string>("");
  const [totalDuration, setTotalDuration] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [travelMode, setTravelMode] = useState<string>("DRIVING");

  useEffect(() => {
    if (!isOpen) return;

    const initializeMap = async () => {
      if (!mapRef.current || isLoaded) return;      try {
        setLoading(true);
        await googleMapsLoader.load();

        if (
          isNaN(eventLocation.coordinates.lat) ||
          isNaN(eventLocation.coordinates.lng)
        ) {
          throw new Error("Invalid event location coordinates");
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: {
            lat: eventLocation.coordinates.lat,
            lng: eventLocation.coordinates.lng,
          },
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_RIGHT,
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          fullscreenControl: true,
        });

        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          polylineOptions: {
            strokeColor: "#E57200",
            strokeWeight: 6,
            strokeOpacity: 0.8,
          },
          markerOptions: {
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="32" height="52" viewBox="0 0 32 52" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 11.25 16 36 16 36s16-24.75 16-36C32 7.163 24.837 0 16 0z" fill="#E57200"/>
                  <circle cx="16" cy="16" r="8" fill="white"/>
                  <circle cx="16" cy="16" r="5" fill="#E57200"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 52),
              anchor: new google.maps.Point(16, 52),
            },
          },
          suppressMarkers: false,
        });

        directionsRenderer.setMap(mapInstance);

        const eventMarker = new google.maps.Marker({
          position: {
            lat: eventLocation.coordinates.lat,
            lng: eventLocation.coordinates.lng,
          },
          map: mapInstance,
          title: eventLocation.address,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="52" viewBox="0 0 32 52" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 11.25 16 36 16 36s16-24.75 16-36C32 7.163 24.837 0 16 0z" fill="#E57200"/>
                <circle cx="16" cy="16" r="8" fill="white"/>
                <circle cx="16" cy="16" r="5" fill="#E57200"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 52),
            anchor: new google.maps.Point(16, 52),
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #E57200; font-weight: bold;">Event Location</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">${eventLocation.address}</p>
            </div>
          `,
        });

        eventMarker.addListener("click", () => {
          infoWindow.open(mapInstance, eventMarker);
        });

        mapInstanceRef.current = mapInstance;
        directionsServiceRef.current = directionsService;
        directionsRendererRef.current = directionsRenderer;
        setIsLoaded(true);
        setLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setError(
          "Failed to load map. Please check your internet connection and try again."
        );
        setLoading(false);
      }
    };

    initializeMap();
  }, [
    isOpen,
    eventLocation.coordinates.lat,
    eventLocation.coordinates.lng,
    isLoaded,
  ]);
  const getUserLocation = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser. You can still view the location on the map."
      );
      setLoading(false);
      return;
    }

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
        console.warn(
          "High accuracy location failed, trying with lower accuracy:",
          error
        );

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(location);
            setLoading(false);
          },
          (fallbackError) => {
            console.error("Error getting user location:", fallbackError);
            let errorMessage = "Unable to get your location. ";

            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage +=
                  "Please allow location access in your browser settings and refresh the page.";
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage +=
                  "Your device's location service may be disabled. Please enable it and try again.";
                break;
              case fallbackError.TIMEOUT:
                errorMessage +=
                  "Location request timed out. Please check your internet connection.";
                break;
              default:
                errorMessage +=
                  "Please check your browser's location settings.";
            }

            setError(errorMessage);
            setLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000, 
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, []);
  const getDirections = useCallback(
    async (mode?: string) => {
      if (
        !userLocation ||
        !directionsServiceRef.current ||
        !directionsRendererRef.current ||
        !window.google
      )
        return;

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
        let googleTravelMode: google.maps.TravelMode;
        const modeToUse = mode || travelMode;

        switch (modeToUse) {
          case "WALKING":
            googleTravelMode = window.google.maps.TravelMode.WALKING;
            break;
          case "TRANSIT":
            googleTravelMode = window.google.maps.TravelMode.TRANSIT;
            break;
          case "DRIVING":
          default:
            googleTravelMode = window.google.maps.TravelMode.DRIVING;
        }

        const request: google.maps.DirectionsRequest = {
          origin: { lat: userLocation.lat, lng: userLocation.lng },
          destination: {
            lat: eventLocation.coordinates.lat,
            lng: eventLocation.coordinates.lng,
          },
          travelMode: googleTravelMode,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
          optimizeWaypoints: true,
        };

        directionsServiceRef.current.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);

            const route = result.routes[0];
            if (route) {
              setTotalDistance(route.legs[0].distance?.text || "");
              setTotalDuration(route.legs[0].duration?.text || "");

              const steps: RouteStep[] = [];
              route.legs.forEach((leg) => {
                leg.steps?.forEach((step) => {
                  steps.push({
                    instruction:
                      step.instructions?.replace(/<[^>]*>/g, "") || "Continue",
                    distance: step.distance?.value || 0,
                    duration: step.duration?.value || 0,
                    maneuver: step.maneuver || "straight",
                  });
                });
              });
              setRoute(steps);
            }
          } else {
            console.error("Directions request failed:", status);
            let errorMessage = "Failed to get directions. ";

            switch (status) {
              case google.maps.DirectionsStatus.NOT_FOUND:
                errorMessage += "Route not found. Please check the locations.";
                break;
              case google.maps.DirectionsStatus.ZERO_RESULTS:
                errorMessage +=
                  "No route could be found between these locations.";
                break;
              case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                errorMessage += "Too many requests. Please try again later.";
                break;
              case google.maps.DirectionsStatus.REQUEST_DENIED:
                errorMessage +=
                  "Request denied. Please check API configuration.";
                break;
              default:
                errorMessage += "Please try again.";
            }

            setError(errorMessage);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error getting directions:", error);
        setError(
          "Failed to get directions. Please check your connection and try again."
        );
        setLoading(false);
      }
    },
    [userLocation, eventLocation, travelMode]
  );

  const handleGetDirections = useCallback(() => {
    if (userLocation) {
      getDirections();
    } else {
      getUserLocation();
    }
  }, [getUserLocation, getDirections, userLocation]);
  const handleTravelModeChange = useCallback(
    (mode: string) => {
      setTravelMode(mode);
      if (userLocation) {
        getDirections(mode);
      }
    },
    [userLocation, getDirections]
  );

  useEffect(() => {
    if (userLocation && isOpen && isLoaded) {
      getDirections();
    }
  }, [userLocation, isOpen, isLoaded, getDirections]);

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
  
  // Open in Google Maps
  // const openInGoogleMaps = useCallback(() => {
  //   if (userLocation) {
  //     const origin = `${userLocation.lat},${userLocation.lng}`;
  //     const destination = `${eventLocation.coordinates.lat},${eventLocation.coordinates.lng}`;
  //     const travelModeParam = travelMode === "WALKING" ? '2' : travelMode === "TRANSIT" ? '3' : '0';
  //     const url = `https://www.google.com/maps/dir/${origin}/${destination}/@${destination},13z/data=!3m1!4b1!4m2!4m1!3e${travelModeParam}`;
  //     window.open(url, '_blank');
  //   } else {
  //     const destination = `${eventLocation.coordinates.lat},${eventLocation.coordinates.lng}`;
  //     const url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
  //     window.open(url, '_blank');
  //   }
  // }, [userLocation, eventLocation, travelMode]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <MapIcon className="w-6 h-6 text-[#E57200]" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Directions
              </h2>
              <p className="text-gray-600 text-sm">{eventLocation.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {userLocation && (
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Travel Mode:
              </span>{" "}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTravelModeChange("DRIVING")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    travelMode === "DRIVING"
                      ? "bg-[#E57200] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Car className="w-4 h-4" />
                  Driving
                </button>
                <button
                  onClick={() => handleTravelModeChange("WALKING")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    travelMode === "WALKING"
                      ? "bg-[#E57200] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  Walking
                </button>
                <button
                  onClick={() => handleTravelModeChange("TRANSIT")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    travelMode === "TRANSIT"
                      ? "bg-[#E57200] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Route className="w-4 h-4" />
                  Transit
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 flex">
          <div className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[rgba(229,114,0)] mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    {userLocation
                      ? "Getting directions..."
                      : "Getting your location..."}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    This may take a few moments
                  </p>
                </div>
              </div>
            )}{" "}
            {error && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center p-6 max-w-lg">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Unable to Get Location
                  </h3>
                  <p className="text-red-600 mb-4 text-sm leading-relaxed">
                    {error}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleGetDirections}
                      className="bg-[rgba(229,114,0)] hover:bg-[rgba(194,91,52)] text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setError(null);
                      }}
                      className="text-[#E57200] hover:text-[rgba(194,91,52)] px-6 py-2 rounded-lg transition-colors text-sm"
                    >
                      Continue without directions
                    </button>
                  </div>{" "}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-left">
                    <p className="text-xs text-blue-800 font-medium mb-1">
                      💡 Troubleshooting Tips:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Make sure location services are enabled</li>
                      <li>• Check your browser&apos;s location permissions</li>
                      <li>• Try refreshing the page</li>
                      <li>• Ensure you have a stable internet connection</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div
              ref={mapRef}
              className="w-full h-full rounded-lg"
              style={{ minHeight: "400px" }}
            />{" "}
            {!userLocation && !loading && !error && (
              <div className="absolute bottom-6 left-6 z-[1000]">
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                  <p className="text-sm text-gray-600 mb-3">
                    Get turn-by-turn directions from your current location
                  </p>
                  <button
                    onClick={handleGetDirections}
                    className="w-full bg-[rgba(229,114,0)] hover:bg-[rgba(194,91,52)] text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-colors font-medium"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </button>
                </div>
              </div>
            )}
          </div>

          {userLocation && route.length > 0 && (
            <div className="w-96 border-l bg-gray-50 flex flex-col">
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Route className="w-4 h-4" />
                  <span className="font-medium">Route Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-[#E57200]" />
                      <span className="text-xs text-gray-600">Distance</span>
                    </div>
                    <span className="font-bold text-lg text-gray-800">
                      {totalDistance}
                    </span>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[#E57200]" />
                      <span className="text-xs text-gray-600">Duration</span>
                    </div>
                    <span className="font-bold text-lg text-gray-800">
                      {totalDuration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Step-by-Step Directions
                  </h3>
                  <div className="space-y-3">
                    {route.map((step, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[rgba(229,114,0)] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 mb-2 leading-relaxed">
                              {step.instruction}
                            </p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {formatDistance(step.distance)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(step.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>{" "}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">Powered by Google Maps</div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (userLocation) {
                  const origin = `${userLocation.lat},${userLocation.lng}`;
                  const destination = `${eventLocation.coordinates.lat},${eventLocation.coordinates.lng}`;
                  const travelModeParam =
                    travelMode === "WALKING"
                      ? "2"
                      : travelMode === "TRANSIT"
                      ? "3"
                      : "0";
                  const url = `https://www.google.com/maps/dir/${origin}/${destination}/@${destination},13z/data=!3m1!4b1!4m2!4m1!3e${travelModeParam}`;
                  window.open(url, "_blank");
                } else {
                  const destination = `${eventLocation.coordinates.lat},${eventLocation.coordinates.lng}`;
                  const url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
                  window.open(url, "_blank");
                }
              }}
              className="px-4 py-2 text-[#E57200] border border-[#E57200] rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
            >
              Open in Google Maps
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDirectionsMap;
